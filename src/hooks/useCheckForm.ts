export type CheckRules<T extends object> = {
  [P in keyof T]: (value: T[P]) => true | string
}

export function useCheckForm<T extends object>(rules: CheckRules<T>) {
  const errors: Partial<Record<keyof T, string | boolean>> = {}

  const checkItem = <K extends keyof T, V extends T[K]>(key: K, value: V) => {
    const errMsg = rules[key]?.(value)
    errors[key] = errMsg
  }

  const checkForm = (formData: T, ...omits: Array<keyof T>) => {
    for (const key in rules) {
      if (omits.includes(key)) continue
      const value = formData[key]
      const errMsg = rules[key](value)
      if (errMsg !== true) throw new Error(errMsg)
    }
  }

  return {
    errors,
    checkItem,
    checkForm
  }
}
