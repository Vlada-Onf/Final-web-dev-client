export type ApiLinks = {
  first?: string,
  last?: string,
  prev?: string,
  next?: string
}
interface ApiMetaLinks {
  url?: string,
  label: string,
  active: boolean
}
export type ApiMeta = {
  current_page: number,
  from: number,
  last_page: number,
  links: ApiMetaLinks[],
  path: string,
  per_page: number,
  to: number,
  total: number
};

export interface ApiResponse<DataT> {
  data: DataT,
  links?: ApiLinks,
  meta?: ApiMeta,
}

export * from './user';
