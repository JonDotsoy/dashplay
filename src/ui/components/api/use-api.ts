import useSWR from "swr"

const wrapFetch = async (relativePath: string) => {
  const res = await fetch(new URL(`api/${relativePath}`, new URL(import.meta.env.BASE_URL, import.meta.url)))
  if (!res.ok) {
    throw new Error(`Response status ${res.status}: ${await res.text()}`)
  }
  return res.json()
}

const useApi = (relativePath: string) => {
  return useSWR(relativePath, wrapFetch)
}

export default useApi
