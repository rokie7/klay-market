import axios from "axios";

//파일을 업로드하여 IPFS의 해쉬값을 리턴.
export const getIPFSHash = async(file) => {
    const formData = new FormData();
    formData.append('file',file);
  
    const IPFShash = await axios({
      method : 'post',
      baseURL: 'https://ipfs.infura.io:5001',
      url : 'api/v0/add',
      data:formData,
      headers: {'Content-type' : 'multipart/form-data'}
    }).then((response)=>{
      console.log('IPFS 업로드 성공');
      alert('업로드에 성공했습니다.');
      return response.data.Hash;
    })
  
    return IPFShash;
  }