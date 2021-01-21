import request from "../utils/request";

export async function apiInitData(params) {
  return request("/api/v1/user", {
      params,
  })
}

export async function apiInitSymbol(params) {
    return request("/api/v1/user_share_config/user_share_config_detail", {
        params,
    })
}

export async function apiEditRow(params){
    return request('/api/v1/user_share_config/edit_single_config', {
        method: "POST",
        data: params,
    })
}

export async function apiAddShare(params){
    return request('/api/v1/user_share_config/add_share', {
        method: "POST",
        data: params,
    })
}

export async function apiDeleteShare(params){
    return request('/api/v1/user_share_config/delete_share', {
        method: "POST",
        data: params,
    })
}

export async function apiQueryShareInfo(params){
    return request('/api/v1/share_info', {
        params,
    })
}
