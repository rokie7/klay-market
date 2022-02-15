import React, { useEffect } from 'react';
import logo from './logo.svg';
import QRCode from 'qrcode.react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHome, faWallet, faPlus} from "@fortawesome/free-solid-svg-icons";
import {getBalance, fetchCardsOf} from './api/UseCaver';
import './App.css';
import { useState } from 'react';
import * as KlipAPI from "./api/UseKlip";
import * as KasAPI from "./api/UseCAS";
import "bootstrap/dist/css/bootstrap.min.css"; //react-bootstrap관련 css
import { Alert, Button, Card, Container, Form, Nav, Modal, Row, Col } from 'react-bootstrap';
import "./market.css";
import { MARKET_CONTRACT_ADDRESS } from './constants';
import IpfsApi from 'ipfs-api';
// 1.start contract 배포주소 파악(가져오기)
// 2.caver.js이용해서 스마트 컨트렉트 연동하기
// 3.가져온 스마트 컨트렉트 실험결과(데이터) 웹에 포현하기

const DEFAULT_QR_CODE = "DEFAULT";
const DEFAULT_ADDRESS = "0x00000000000000000";
//const DEFAULT_ADDRESS = "0x70814F8dA1dFA290b69D636406634784D94D2508";
function App() {

  const [nfts , setNfts] = useState([]);
  const [myBalance , setMyBalance] = useState('0');
  const [myAddress , setMyAddres] = useState(DEFAULT_ADDRESS);
 
  //UI
  const [qrvalue,setQrvalue] = useState(DEFAULT_QR_CODE);
  const [tab, setTab] =useState('MARKET');  //MARKET, MINT, WALLET
  
  const [mintBookTitle, setMintBookTitle] = useState("책이름");   //책이름
  const [mintImageUrl, setMintImageUrl] = useState(""); //썸네일
  const [mintTokenID, setMintTokenID] = useState("");   //토큰id
  const [mintBookUrl, setMintBookUrl] = useState("");   //책PDF파일
  const [mintDesc, setMintDesc] = useState("");   //책PDF파일


  //Modal
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState({
    title : "MODAL",
    onConfirm: () =>{}
  });

  const [isMouseOver, setMouseOver] = useState(false);

  const rows = nfts.slice(nfts.length / 2);

  //fetchMarketNFT
  const fetchMarketNFTs = async () =>  {

    //const _nfts = await fetchCardsOf(myAddress);
    const _nfts = await fetchCardsOf(MARKET_CONTRACT_ADDRESS);
    
    setNfts(_nfts);
    console.log('fetchMarketNFTs  실행완료');

  }

  //fetchMyNFTs
  const fetchMyNFTs = async () =>  {
    if(myAddress ===DEFAULT_ADDRESS) {
      alert("No Address");
      return;
    }
    const _nfts = await fetchCardsOf(myAddress);
    //const _nfts = await fetchCardsOf("0x70814F8dA1dFA290b69D636406634784D94D2508");
    //test
    setNfts(_nfts);
    console.log('fetchMyNFTs  실행완료');
    //1.tokenOfOwnerByIndex -> 내가가진 NFT tokenID를 하나씩 가져온다. 
    // 0x70814F8dA1dFA290b69D636406634784D94D2508 , 0 --> 1006801
    // 0x70814F8dA1dFA290b69D636406634784D94D2508 , 1 --> 1006802
    
    //2.balanceOf -> 내가가진 전체 nft개수

    //3.tokenURI -> tokenID를 이용해서 tokenURI를 하나씩 가져온다.

  }
  


  //onClickMint

  const onClickMint = async (uri, tokenID,bookTitle,boodUrl,desc)  => {
    if(myAddress ===DEFAULT_ADDRESS) {
      alert("No Address");
      return;
    }

    //asset  upload api
    //const assetdata =  await KasAPI.uploadAssetData();

    // if(!assetdata) {
    //   alert('메타데이터 업로드에 실패하였습니다.');
    //   return;
    // } else {
    //   alert('메타데이터 업로드 완료!');
    // }
    
    //metadata upload
    const metadataURL = await KasAPI.uploadMetaData(uri,bookTitle,boodUrl,desc);

    if(!metadataURL) {
      alert('메타데이터 업로드에 실패하였습니다.');
      return;
    } 
    
    //const randomTokenId = parseInt(Math.random() * 10000000);
    console.log(`tokenID : ${tokenID}`);
    KlipAPI.mintCardWithURI(myAddress,tokenID,metadataURL,setQrvalue,(result) =>{console.log(JSON.stringify(result))});
    
  }

  const onClickCard = (tokenID) => {
    if(tab === "WALLET") {
      setModalProps({
        title: "NFT를 마켓에 올릴까요?",
        onConfirm:()=>{
          onclickMyCard(tokenID);
        }
      });
      setShowModal(true);
      
    }

    if(tab === "MARKET") {
      setModalProps({
        title: "NFT를 구매할까요?",
        onConfirm:()=>{
          onClickMarketCard(tokenID);
        }
      });
      setShowModal(true);
      
    }

  }

  const onclickMyCard = (tokenID) => {
    KlipAPI.listingCard(myAddress,tokenID,setQrvalue,(result) =>{console.log(JSON.stringify(result))});
  }

  const onClickMarketCard = (tokenID) => {
    KlipAPI.buyCard(tokenID,setQrvalue,(result) =>{console.log(JSON.stringify(result))});
  }

  //onclickMyCard
  //onClickMarketCard
  //getUserData
  const getUserData = () => {
    console.log('getUserData실행');
    setModalProps({
      title:"Klip 지갑을 연동하시겠습니까?",
      onConfirm:() => {
        KlipAPI.getAddress(setQrvalue, async (address) =>{
          setMyAddres(address);
          const _balance = await getBalance(address);
          setMyBalance(_balance);
        });

      }
    });
    setShowModal(true);
    
  }

  
  //readCount();
  //getBalance('0x7b48c40234560cd0c9fd2c5e00042b0a5ccf7fda');
  const onClickgetAddress = () => {
    KlipAPI.getAddress(setQrvalue);
  }
/*
  const onClickSetCount = () => {
    console.log("1111-");
    KlipAPI.setCount(2000,setQrvalue);
  }
  */
useEffect(()=>{
  getUserData();
  fetchMarketNFTs();
},[])

  return (

    <div className="App" >
       <div style={{backgroundColor: "black",  padding : 10}}>
        <div
         style={{
           fontSize : 30, 
           fontWeight: "bold", 
           paddingLeft:5, 
           marginTop : 10
          }}
        >
         
         내 지갑
        </div>
       {myAddress}
       <br/>
       <Alert variant={"balance"}   style={{backgroundColor : "#f40034", fontSize : 25}} onClick={getUserData}>
       {myAddress !== DEFAULT_ADDRESS ? `${myBalance} KLAY` : '지갑 연동하기'}
       

       </Alert>
       
       {qrvalue !== "DEFAULT" ? (
        
        <Container style={{backgroundColor:"white", width : 300, height : 300, padding: 20}}>
          <QRCode value={qrvalue} size={256}/>
        </Container>


       ) : null  } 
       
       {/*갤러리*/}
       {tab === "MARKET" || tab === "WALLET" ? (
         <div className='container' style={{padding : 20,width:"100%"}}> 

          {rows.map((o,rowIndex) =>(
             
              <Row>
                <Col style={{marginRight : 0, padding:0}}>
                    <Card onClick={()=>{
                        onClickCard(nfts[rowIndex * 2].id);
                    }}>
                      <Card.Img  key={rowIndex} src={nfts[rowIndex * 2].uri}/>
                    </Card>
                    {rowIndex*2}. [{nfts[rowIndex * 2].id}] NFT
                    <br/>
                    이름 :{nfts[rowIndex * 2].name} 
                    <br/>설명 : {nfts[rowIndex * 2].description}
                    <br/>속성1 : {nfts[rowIndex * 2].test1}
                    <br/>속성2 : {nfts[rowIndex * 2].test2}
                </Col>

                <Col style={{marginRight : 0, padding:0}}>
                 {nfts.length > rowIndex * 2 + 1 ?
                  <Card onClick={()=>{
                      onClickCard(nfts[rowIndex * 2 + 1].id);
                  }}>
                    <Card.Img key={rowIndex*2+1}src={nfts[rowIndex * 2 + 1].uri}/>
                  </Card>
                  : null}
                  {nfts.length > rowIndex * 2+1 ?
                  <>{rowIndex*2+1}. [{nfts[rowIndex * 2 + 1].id}] NFT
                  <br/>
                    이름 :{nfts[rowIndex * 2+1].name} 
                    <br/>설명 : {nfts[rowIndex * 2+1].description}
                    <br/>속성1 : {nfts[rowIndex * 2+1].test1}
                    <br/>속성2 : {nfts[rowIndex * 2+1].test2}
                    </>
                  : null}
                  </Col>


              </Row>

          ))}
         {/*nfts.map((nft,index) =>(
           <React.Fragment key={nft+index}>
           <Card.Img onClick={()=>{onClickCard(nft.id);}} className='img-responsive' src={nfts[index].uri}></Card.Img>
           </React.Fragment>
         ))*/}
       </div>
       ) : null}
        <br/><br/><br/><br/><br/>
       {tab === "MINT" ? (
       <div className="container" style={{padding:0, width:"100%"}}>
          <Card className="text-center" style={{color : "black", height:"50%",borderColor:"#C5B358"}}>
            <Card.Body style={{opacity:0.9, backgroundColor:"black"}}>
              {mintImageUrl !== "" ? <Card.Img src={mintImageUrl} style={{color : "black", height:"200px",width:"200px"}}/> : null}
              <Form>
                <Form.Group>
                  
                  <Form.Control value={mintImageUrl} onChange={(e)=>{
                      console.log(e.target.value);
                      setMintImageUrl(e.target.value);
                  }}
                  type="text"
                  placeholder='썸네일 주소를 입력해주세요'
                  />

                  <Form.Control value={mintTokenID} onChange={(e)=>{
                      console.log(e.target.value);
                      setMintTokenID(e.target.value);
                  }}
                  type="text"
                  placeholder='토큰ID를 입력해주세요'
                  />

                  <Form.Control value={mintBookTitle} onChange={(e)=>{
                      console.log(e.target.value);
                      setMintBookTitle(e.target.value);
                  }}
                  type="text"
                  placeholder='발행할 책이름을 입력해주세요'
                  />

                  <Form.Control value={mintBookUrl} onChange={(e)=>{
                      console.log(e.target.value);
                      setMintBookUrl(e.target.value);
                  }}
                  type="text"
                  placeholder='책 PDF파일링크를 넣어주세요'
                  />

                  <Form.Control value={mintDesc} onChange={(e)=>{
                      console.log(e.target.value);
                      setMintDesc(e.target.value);
                  }}
                  type="text"
                  placeholder='책 설명을 작성해주세요'
                  />


                </Form.Group>
                <br/>
                <Button onClick={()=>{onClickMint(mintImageUrl,mintTokenID,mintBookTitle,mintBookUrl,mintDesc)}} variant='primary' style={{backgroundColor : "#810034", borderColor: "white"}}> 발행하기</Button>
              </Form>
            </Card.Body>
          </Card>
       


        </div>
        ) : null}
          


       </div>
       
      {/*주소잔고*/}

   
      {/*발행페이지*/}
      


      {/*모달*/}
      <Modal centered size="sm" show={showModal} onHide={()=>{
        setShowModal(false);
      }}>
        <Modal.Header style={{border:0, backgroundColor:"black", opacity:0.8}}>
          <Modal.Title>{modalProps.title}</Modal.Title>
        </Modal.Header>
        <Modal.Footer style={{border:0, backgroundColor:"black", opacity:0.8}}>
          <Button variant='secondary' onClick={()=>{
            setShowModal(false);
            }}>닫기</Button>
          <Button variant='primary' onClick={()=>{
            modalProps.onConfirm();
            setShowModal(false)
            }} style={{backgroundColor:"#810034",borderColor:"white" }}>진행</Button>

        </Modal.Footer>
      </Modal>

      {/*텝*/}
      <nav style={{backgroundColor : "#1b1717", height : 45}} className="navbar fixed-bottom navbar-light" role="navigation">
          <Nav className='w-100'>
            <div className='d-flex flex-row justify-content-around w-100'>
              <div onClick={()=>{
                setTab("MARKET");
                fetchMarketNFTs();
                console.log("MARKET");
              }} className="row d-flex flex-column justify-content-center align-items-center">
                <div><FontAwesomeIcon color='white' size='lg' icon={faHome}/></div>


              </div>

              <div  onClick={()=>{
                setTab("MINT");
                console.log("MINT");

              }} className="row d-flex flex-column justify-content-center align-items-center">
                <div><FontAwesomeIcon color='white' size='lg' icon={faPlus}/></div>


              </div>

              <div onClick={()=>{
                setTab("WALLET");
                fetchMyNFTs();
                console.log("WALLET");

              }} className="row d-flex flex-column justify-content-center align-items-center">
                <div><FontAwesomeIcon color={isMouseOver ?"red" : "white"} size='lg' icon={faWallet} 
                  onMouseOver={()=>{setMouseOver(true)}}
                  onMouseOut={()=>{setMouseOver(false)}}
                  /></div>


              </div>

            </div>

            

           

          </Nav>

      </nav>
    </div>

  );
}

export default App;
