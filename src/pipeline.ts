/**
 * 管道解析与进程内过滤：`kubectl get pods -A | grep core | head -n 20`。
 *
 * 设计约束（与 kubectl.ts 一致）：绝不引入 shell —— 管道只是命令行语法糖，
 * 第一段交给 kubectl 子进程，后续段只放行少量“进程内过滤器”，
 * 在 Node 内对 stdout 文本完成过滤，杜绝注入与命令解析歧义。
 *
 * 支持：grep [-i] [-v] [-n] [-c] [-w] [-E] [-F] [-e <pattern>] <pattern>
 *       head -n <N> / tail -n <N> / sort [-r] [-u] / wc [-l]
 * 不支持：重定向、&&、||、多命令、任意程序（会得到明确报错）。
 */

import { K8sConsoleError, asError } from './errors.ts'
import { normalizeKubectlArgs, splitCommand } from './kubectl.ts'

export type OutputFilter =
  | {
    kind: 'grep'
    patterns: string[]
    ignoreCase: boolean
    invert: boolean
    lineNumbers: boolean
    countOnly: boolean
    wordRegexp: boolean
    fixed: boolean
  }
  | { kind: 'head'; lines: number }
  | { kind: 'tail'; lines: number }
  | { kind: 'sort'; reverse: boolean; unique: boolean }
  | { kind: 'wc' }

export interface ParsedPipeline {
  /** 第一段：kubectl 命令 tokens（已去掉 kubectl 前缀） */
  kubectl: string[]
  /** 后续段：进程内过滤器（按顺序应用） */
  filters: OutputFilter[]
  /** 原始命令行（回显用） */
  raw: string
}

const MAX_FILTERS = 4
const MAX_LINES_ARG = 100_000

/** 过滤器给人看的文案（错误提示与说明共用）。 */
export const FILTERS_HELP_TEXT =
  '| grep [-i -v -n -c -w -E -F] [-e] <pattern>、| head -n <N>、| tail -n <N>、| sort [-r] [-u]、| wc [-l]'

/* ---------------------------------------------------------------- 切分 */

/** 按引号外的 `|` 把命令行切段（引号内字符保真传递，转义交给 splitCommand）。 */
function splitPipeSegments(text: string): string[] {
  const segments: string[] = []
  let current = ''
  let quote: "'" | '"' | null = null
  const input = text ?? ''
  for (const char of input) {
    if (quote !== null) {
      current += char
      if (char === quote) quote = null
      continue
    }
    if (char === "'" || char === '"') {
      quote = char
      current += char
      continue
    }
    if (char === '|') {
      segments.push(current)
      current = ''
      continue
    }
    current += char
  }
  segments.push(current)
  return segments
}

/* ---------------------------------------------------------------- 过滤器解析 */

function badPipeline(message: string): K8sConsoleError {
  return new K8sConsoleError(`管道语法不受支持：${message}。当前仅支持进程内过滤：${FILTERS_HELP_TEXT}`, 'BAD_PIPELINE', 400)
}

/** 解析短 flag 组合（如 `-in`）与长 flag，返回逐个 flag 名集合（长 flag 去掉前缀）。 */
function* iterFlags(token: string): Generator<{ long?: string; short?: string }> {
  if (token.startsWith('--')) {
    yield { long: token.slice(2).toLowerCase() }
    return
  }
  if (token.startsWith('-') && token.length > 1) {
    for (const char of token.slice(1)) yield { short: char.toLowerCase() }
  }
}

function parseGrep(tokens: string[]): OutputFilter {
  const patterns: string[] = []
  const flags = new Set<string>()
  let positionSeen = false
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!
    if (token === '-e' || token === '--regexp') {
      const value = tokens[i + 1]
      if (value === undefined) throw badPipeline('grep -e 缺少 pattern 参数')
      patterns.push(value)
      i += 1
      continue
    }
    if (token.startsWith('-') && token !== '-') {
      for (const flag of iterFlags(token)) {
        if (flag.long !== undefined) {
          const known = ['ignore-case', 'invert-match', 'line-number', 'count', 'word-regexp', 'fixed-strings', 'extended-regexp']
          if (!known.includes(flag.long)) throw badPipeline(`grep 不支持参数 --${flag.long}`)
          flags.add(flag.long)
        } else if (flag.short !== undefined) {
          const known = ['i', 'v', 'n', 'c', 'w', 'f', 'e']
          // -F 与 -f 大小写敏感区分：-f（读文件）不支持，-F（固定串）支持
          if (flag.short === 'f' && token !== '-F') throw badPipeline('grep 不支持参数 -f（读文件）')
          if (flag.short === 'e') throw badPipeline('grep -e 需要单独写成 `-e <pattern>`')
          if (!known.includes(flag.short)) throw badPipeline(`grep 不支持参数 -${flag.short}`)
          flags.add(flag.short === 'f' ? 'fixed-strings' : flag.short)
        }
      }
      continue
    }
    if (positionSeen) throw badPipeline('grep 只支持一个位置参数 pattern（不支持文件参数）')
    patterns.push(token)
    positionSeen = true
  }
  if (patterns.length === 0) throw badPipeline('grep 缺少 pattern（如 | grep core）')
  return {
    kind: 'grep',
    patterns,
    ignoreCase: flags.has('i') || flags.has('ignore-case'),
    invert: flags.has('v') || flags.has('invert-match'),
    lineNumbers: flags.has('n') || flags.has('line-number'),
    countOnly: flags.has('c') || flags.has('count'),
    wordRegexp: flags.has('w') || flags.has('word-regexp'),
    fixed: flags.has('fixed-strings'),
  }
}

function parseLineCount(tokens: string[], name: 'head' | 'tail'): number {
  let count = 10
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!
    if (token === '-n' || token === '--lines') {
      const value = Number(tokens[i + 1])
      if (!Number.isInteger(value) || value < 1 || value > MAX_LINES_ARG) {
        throw badPipeline(`${name} -n 需要一个 1~${MAX_LINES_ARG} 的整数`)
      }
      count = value
      i += 1
      continue
    }
    if (token.startsWith('--lines=')) {
      const value = Number(token.slice('--lines='.length))
      if (!Number.isInteger(value) || value < 1 || value > MAX_LINES_ARG) {
        throw badPipeline(`${name} --lines= 需要一个 1~${MAX_LINES_ARG} 的整数`)
      }
      count = value
      continue
    }
    throw badPipeline(`${name} 只支持 -n <N>（如 | ${name} -n 20）`)
  }
  return count
}

function parseSort(tokens: string[]): OutputFilter {
  const flags = new Set<string>()
  for (const token of tokens) {
    if (token === '--reverse' || token === '--unique') {
      flags.add(token.slice(2))
      continue
    }
    if (token.startsWith('-') && token !== '-') {
      for (const flag of iterFlags(token)) {
        if (flag.short !== undefined && (flag.short === 'r' || flag.short === 'u')) {
          flags.add(flag.short)
          continue
        }
        throw badPipeline(`sort 不支持参数 ${flag.long !== undefined ? `--${flag.long}` : `-${flag.short ?? ''}`}`)
      }
      continue
    }
    throw badPipeline('sort 不支持其它参数')
  }
  return { kind: 'sort', reverse: flags.has('r'), unique: flags.has('u') }
}

function parseWc(tokens: string[]): OutputFilter {
  for (const token of tokens) {
    if (token === '-l' || token === '--lines') continue
    throw badPipeline('wc 只支持 -l（统计行数；裸 wc 也按行数处理）')
  }
  return { kind: 'wc' }
}

function parseFilterSegment(tokens: string[]): OutputFilter {
  const [name, ...rest] = tokens
  switch ((name ?? '').toLowerCase()) {
    case 'grep':
      return parseGrep(rest)
    case 'head':
      return { kind: 'head', lines: parseLineCount(rest, 'head') }
    case 'tail':
      return { kind: 'tail', lines: parseLineCount(rest, 'tail') }
    case 'sort':
      return parseSort(rest)
    case 'wc':
      return parseWc(rest)
    default:
      throw badPipeline(`不支持的过滤器「${name ?? '(空)'}」`)
  }
}

/* ---------------------------------------------------------------- 解析入口 */

/**
 * 把一行命令解析成 { kubectl tokens, filters }。
 * - 无管道时 filters 为空（行为与旧版完全一致）；
 * - 第一段为空 / 过滤段为空 / 过滤器不合法 → 抛 K8sConsoleError(BAD_PIPELINE)。
 */
export function parsePipeline(raw: string): ParsedPipeline {
  const segments = splitPipeSegments(raw ?? '')
  const first = normalizeKubectlArgs(splitCommand(segments[0] ?? ''))
  const filters: OutputFilter[] = []
  for (let i = 1; i < segments.length; i++) {
    const tokens = splitCommand(segments[i] ?? '')
    if (tokens.length === 0) {
      throw badPipeline('存在空的管道段（不支持 || 或以 | 结尾）')
    }
    if (filters.length >= MAX_FILTERS) throw badPipeline(`过滤器最多 ${MAX_FILTERS} 段`)
    filters.push(parseFilterSegment(tokens))
  }
  return { kubectl: first, filters, raw: raw ?? '' }
}

/* ---------------------------------------------------------------- 过滤执行 */

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
}

interface LineMatcher {
  test(line: string): boolean
}

function buildGrepMatcher(filter: Extract<OutputFilter, { kind: 'grep' }>): LineMatcher {
  const flags = filter.ignoreCase ? 'iu' : 'u'
  const matchers: Array<(line: string) => boolean> = []
  for (const pattern of filter.patterns) {
    let source = pattern
    if (filter.fixed) source = escapeRegExp(pattern)
    let regex: RegExp
    try {
      regex = new RegExp(source, flags)
    } catch {
      // 非法正则回退为字面量匹配（对 kubectl 输出里的资源名等场景足够）
      regex = new RegExp(escapeRegExp(pattern), flags)
    }
    if (filter.wordRegexp) {
      const word = filter.fixed ? escapeRegExp(pattern) : source
      try {
        regex = new RegExp(`(?:^|[^\\p{L}\\p{N}_])(?:${word})(?:$|[^\\p{L}\\p{N}_])`, flags)
      } catch {
        regex = new RegExp(escapeRegExp(pattern), flags)
      }
    }
    matchers.push((line) => regex.test(line))
  }
  return {
    test(line: string): boolean {
      const hit = matchers.some((match) => match(line))
      return filter.invert ? !hit : hit
    },
  }
}

function applyFilterToLines(lines: string[], filter: OutputFilter): string[] {
  switch (filter.kind) {
    case 'grep': {
      const matcher = buildGrepMatcher(filter)
      if (filter.countOnly) {
        let count = 0
        for (const line of lines) if (matcher.test(line)) count += 1
        return [String(count)]
      }
      if (filter.lineNumbers) {
        const out: string[] = []
        lines.forEach((line, index) => {
          if (matcher.test(line)) out.push(`${index + 1}:${line}`)
        })
        return out
      }
      return lines.filter((line) => matcher.test(line))
    }
    case 'head':
      return lines.slice(0, filter.lines)
    case 'tail':
      return lines.length <= filter.lines ? lines : lines.slice(lines.length - filter.lines)
    case 'sort': {
      const sorted = [...lines].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
      if (filter.reverse) sorted.reverse()
      if (!filter.unique) return sorted
      const seen = new Set<string>()
      return sorted.filter((line) => {
        if (seen.has(line)) return false
        seen.add(line)
        return true
      })
    }
    case 'wc':
      return [String(lines.length)]
  }
}

/**
 * 对 stdout 文本按顺序应用过滤器。
 * 输入通常以 \n 结尾：末尾空行不参与统计/过滤，输出恢复为以 \n 结尾（有输出时）。
 */
export function applyOutputFilters(input: string, filters: readonly OutputFilter[]): string {
  let lines = (input ?? '').split('\n')
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
  for (const filter of filters) lines = applyFilterToLines(lines, filter)
  return lines.length > 0 ? `${lines.join('\n')}\n` : ''
}

/** 过滤器摘要（提示/日志用）：如 `grep core | head -n 20`。 */
export function describeFilters(filters: readonly OutputFilter[]): string {
  return filters.map((filter) => {
    switch (filter.kind) {
      case 'grep': {
        const flags =
          (filter.ignoreCase ? ' -i' : '') +
          (filter.invert ? ' -v' : '') +
          (filter.lineNumbers ? ' -n' : '') +
          (filter.countOnly ? ' -c' : '') +
          (filter.wordRegexp ? ' -w' : '') +
          (filter.fixed ? ' -F' : '')
        const patterns = filter.patterns.map((pattern) => (/\s/u.test(pattern) ? JSON.stringify(pattern) : pattern))
        const explicitE = filter.patterns.length > 1
        return `grep${flags}${explicitE ? ' -e ' : ' '}${patterns.join(' -e ')}`
      }
      case 'head':
        return `head -n ${filter.lines}`
      case 'tail':
        return `tail -n ${filter.lines}`
      case 'sort':
        return `sort${filter.reverse ? ' -r' : ''}${filter.unique ? ' -u' : ''}`
      case 'wc':
        return 'wc -l'
    }
  }).join(' | ')
}

/** 便捷封装：解析失败的错误转成可读消息（工具/HTTP 层用）。 */
export function pipelineErrorText(reason: unknown): string {
  return asError(reason).message
}
