
export const isValidPath = (path: string) => {
  return path
         && path !== ''
         && path.charAt(0) !== '/'
         && path.charAt(path.length - 1) !== '/'
}

export const pathMeta = (path: string) => {
  if (!isValidPath(path))
    return null

  const pathSplit = path.split('/').filter(i => i !== '')
  let folders: string[] = []
  let name

  if (pathSplit.length === 1)
    name = pathSplit[0]
  if (pathSplit.length > 1)
    name = pathSplit[pathSplit.length - 1]

  pathSplit.pop()
  folders = pathSplit

  return {
    folders,
    name
  }
}

interface IFilesArr {
  name: string
}

export const getUniqueName = (prefix: string, files: IFilesArr[]) => {
  let i = 1
  let uniqueName = prefix
  while (files.find(({ name }) => name === uniqueName)) {
    uniqueName = `${prefix} (${i})`
    i++
  }
  return uniqueName
}

export const getFullPath = (folder: string, name: string) => {
  const pre = folder.split('/').filter(i => i !== '')
  const post = name.split('/').filter(i => i !== '')
  return [...pre, ...post].join('/')
}
