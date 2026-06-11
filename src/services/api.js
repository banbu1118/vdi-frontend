import axios from 'axios'

export async function getToken(width, height) {
  const vmid = localStorage.getItem('rdp_vmid')
  
  if (!vmid) {
    throw new Error('缺少 RDP 连接参数')
  }
  
  const response = await axios.post('/guacamole/token', {
    vmid: vmid,
    width: width.toString(),
    height: height.toString()
  })
  
  if (response.data.code === 0) {
    return response.data.data
  } else {
    throw new Error(response.data.message || '获取 RDP 连接凭证失败')
  }
}
