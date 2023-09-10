const p=8;
const q=4;
let parts1;
let parts2;
let container0;
let container1;
let uls;
document.addEventListener("DOMContentLoaded",(e)=>{
    container0=document.querySelector("#container0.container");
    parts1=container0.querySelectorAll(".parts");
    container1=document.querySelector("#container1.container");
    uls=document.querySelectorAll("ul");
    parts2=container1.querySelectorAll(".parts");
});



function updatecount(imageContainer){
    const result = imageContainer.parentElement.querySelector("#result");
    const li_list= imageContainer.querySelectorAll("li");
    let count=0;
    let checked_count=0;
    for(li of li_list){
        count++;
        if(li.classList.contains("checked"))checked_count++;
    }
    if(result)result.textContent = `選択された要素数: ${checked_count} / 全体の要素数: ${count}`;
}
function allselect(button,flag){
    const element=button.parentElement.parentElement;
    const imageContainer=element.querySelector("#image-container");
    const li_list= imageContainer.querySelectorAll("li");
    for (li of li_list){
        const input=li.querySelector("input");
        if(flag){
            li.classList.add("checked");
            input.setAttribute('checked', true) ;
        }
        else{
            li.classList.remove("checked");
            input.removeAttribute('checked')
        }
    }
    updatecount(imageContainer);
}
function removeSelectedElements(button){
    const element=button.parentElement.parentElement;
    const imageContainer=element.querySelector("#image-container");
    const li_list= imageContainer.querySelectorAll("li");
    for (let i=li_list.length-1;i>=0;i--){
        const li=li_list[i];
        if(li.classList.contains("checked"))li.remove();
    }
    updatecount(imageContainer);
}
function duplicateSelectedElements(button){
    const element=button.parentElement.parentElement;
    const imageContainer=element.querySelector("#image-container");
    const li_list= imageContainer.querySelectorAll("li");
    for (let i=li_list.length-1;i>=0;i--){
        const li=li_list[i];
        if(li.classList.contains("checked")){
            const clone=li.cloneNode(true);
            clone.classList.remove("checked");
            const input=clone.querySelector("input");
            input.removeAttribute('checked');
            imageContainer.appendChild(clone);
        }
    }
    updatecount(imageContainer);
}
function save(img){
    const downloadLink = document.createElement('a');
    downloadLink.href = img.src; // 画像のURLを設定
    downloadLink.download = img.alt; // ダウンロード時のファイル名を設定

    // ダウンロード用リンクをクリック（自動的にダウンロードが開始されます）
    downloadLink.click();
}
function saveSelectedElements(button){
    const element=button.parentElement.parentElement;
    const imageContainer=element.querySelector("#image-container");
    const li_list= imageContainer.querySelectorAll("li");
    for (let i=li_list.length-1;i>=0;i--){
        const li=li_list[i];
        if(li.classList.contains("checked")){
            const img=li.getElementsByClassName("img2")[0];
            save(img);
        }
    }
}
function resetvalue(input){
    input.value = '';
}
function getParentImageContainer(element){
    while (element.parentNode) {
        element = element.parentNode;
        if (element.id == 'image-container') {
            return element;
        }
    }
    return null;
}
async function includeImage(input,elem){
    const imageContainer = getParentImageContainer(elem);
    const files = input.files;
    flag=false;//1度しかalertは不要
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const image = new Image();
        const fileName = file.name;
        // 画像のファイル形式を確認 (.png のみを許容)
        if (file.type !== "image/png") {
            if (!flag){
                alert("ファイル形式はPNGのみ許容されています。");
                flag=true;
            }
            continue; // 条件に合致しない場合、次のファイルに進む
        }
        image.alt = fileName;
        image.src = URL.createObjectURL(file);
        try {
            await processAndDisplayImage(image, imageContainer);
            await Generalprocess(image.src,16,32,genFrontImage).then((url2) => {
                if (url2 != null) {
                    const image2 = new Image();
                    image2.alt=fileName;
                    image2.src=url2;
                    image2.classList.add("img");
                    // 画像を表示
                    const existingElement=imageContainer.querySelector("#inputFile").nextSibling;
                    const p0 = document.createElement("p");
                    p0.classList.add("checkbox")
                    p0.innerHTML = `<input type="checkbox" class="checkbox_button" checked="true">`;
                    existingElement.insertBefore(image2,existingElement.firstElementChild);
                    existingElement.insertBefore(p0,existingElement.firstElementChild);
                }
            });
        } catch (error) {
            console.error(error);
        }
    }
    updatecount(imageContainer);
}
function getSkinURL(mcid) {
    const url = `https://api.mojang.com/users/profiles/minecraft/${mcid}`;
  
    fetch(url,{
        mode: 'cors'
      })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          console.error("UUIDが見つかりませんでした。");
          return null;
        }
      })
      .then((data) => {
        if (data) {
          const uuid = data.id;
          const skinURL = `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`;
  
          fetch(skinURL,{
            mode: 'cors'
          })
            .then((response) => {
              if (response.status === 200) {
                return response.json();
              } else {
                console.error(`Failed to retrieve skin URL for ${mcid}.`);
                return null;
              }
            })
            .then((data) => {
              if (data) {
                const properties = data.properties;
                for (const prop of properties) {
                  if (prop.name === "textures") {
                    const texturesData = atob(prop.value);
                    const textures = JSON.parse(texturesData);
                    const skinURL = textures.textures.SKIN.url;
                    console.log("スキンURL:", skinURL);
                    return skinURL;
                  }
                }
                console.error(`No skin URL found for ${mcid}.`);
                return null;
              }
            })
            .catch((error) => {
              console.error("スキンデータの取得中にエラーが発生しました。", error);
            });
        }
      })
      .catch((error) => {
        console.error("UUIDの取得中にエラーが発生しました。", error);
      });
}
async function addImage(){
    const imageContainer = container0;
    const input_form=document.querySelector(`[name="mcid"]`);
    const image = new Image();
    const mcid=input_form.value;
    const fileName = mcid+".png";

    image.alt = fileName;
    image.src = getSkinURL(mcid);
    if(image.src==null){
        alert("スキンを見つけられませんでした。")
        return;
    }
    try {
        await processAndDisplayImage(image, imageContainer);
        await Generalprocess(image.src,16,32,genFrontImage).then((url2) => {
            if (url2 != null) {
                const image2 = new Image();
                image2.alt=fileName;
                image2.src=url2;
                image2.classList.add("img");
                // 画像を表示
                const existingElement=imageContainer.querySelector("#inputFile").nextSibling;
                const p0 = document.createElement("p");
                p0.classList.add("checkbox")
                p0.innerHTML = `<input type="checkbox" class="checkbox_button" checked="true">`;
                existingElement.insertBefore(image2,existingElement.firstElementChild);
                existingElement.insertBefore(p0,existingElement.firstElementChild);
            }
        });
    } catch (error) {
        console.error(error);
    }
    input_form.value="";
    updatecount(imageContainer);
}
function addImageElement(text){
    const image2=new Image();
    image2.src="svg/"+text+".svg";
    image2.classList.add(text);
    return image2;
}
function appendimage(imageContainer,image){
    image.classList.add("img2");
    // 画像を表示
    const newItem = document.createElement("li");
    newItem.draggable=true;
    newItem.classList.add("checked");
    //newItem.innerHTML = `<p class="checkbox"><input type="checkbox" class="checkbox_button"></p>`;
    const p1=document.createElement("p");
    p1.innerHTML=image.alt;
    p1.classList.add("text");
    const p2=document.createElement("p");
    p2.innerHTML="";
    p2.classList.add("round_btn");
    newItem.appendChild(image);
    newItem.appendChild(p1);
    newItem.appendChild(p2);
    const image2=addImageElement("download-button");
    const image3=addImageElement("duplicate-button");
    newItem.appendChild(image2);
    newItem.appendChild(image3);
    
    const div1=imageContainer.querySelector("#inputFile");
    if(div1!=null&&div1.nextSibling)imageContainer.insertBefore(newItem,div1.nextSibling);
    else imageContainer.appendChild(newItem);
    // imageContainer.appendChild(newItem);
}
async function processAndDisplayImage(image, imageContainer) {
    return new Promise((resolve, reject) => {
        image.onload = function () {
            const height = image.height;
            const width = image.width
            // 画像のサイズを確認 (64x64 または 32x64 のみを許容)
            if (!((height === 64 && width === 64) || (height === 32 && width === 64))) {
                reject("Invalid image size");
                return;
            }
            if (height === 32) {
                process(image.src,resizeimage)
                .then((url) => {
                    if (url != null) {
                        image.src = url;
                        appendimage(imageContainer,image);
                    }
                    resolve();
                })
                .catch((error) => {
                    console.error(error);
                    resolve();
                });
            } else {
                // 画像を表示
                appendimage(imageContainer,image);
                resolve();
            }
        };
    });
}
const process=async function processImage(ImageURL,func){
    return Generalprocess(ImageURL,64,64,func)
}
const Generalprocess=async function GeneralprocessImage(ImageURL,width,height,func){
    return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.src = ImageURL;
        img.onload = function () {
            ctx.drawImage(img, 0, 0); // imageをdraw
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const data = imageData.data;
            let dst = ctx.createImageData(width, height);
            dst = func(data, dst);
            canvas.width = width;
            canvas.height=height;
            ctx.putImageData(dst, 0, 0);
            // 処理結果をデータURLとして取得し、表示
            const processedDataURL = canvas.toDataURL("image/png");
            //canvasの破棄
            delete ctx;
            canvas.height = 0;
            canvas.width = 0;
            canvas.remove();
            resolve(processedDataURL);
        };
    });
}
const replace_process=async function (ImageURL1,ImageURL2,func){
    return Generalreplaceprocess(ImageURL1,ImageURL2,64,64,func);
}
const Generalreplaceprocess=async function GeneralprocessImage(ImageURL1,ImageURL2,width,height,func){
    return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext("2d",{
            willReadFrequently: true
        });

        const img = new Image();
        img.src = ImageURL1;
        img.onload = function () {
            ctx.drawImage(img, 0, 0); // imageをdraw
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const data = imageData.data;
            const img2=new Image();
            img2.src=ImageURL2;
            img2.onload=function(){
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img2,0,0);
                const imageData2=ctx.getImageData(0,0,img2.width,img2.height);
                const data2=imageData2.data;
                let dst = ctx.createImageData(width, height);
                dst = func(data,data2, dst);
                canvas.width = width;
                canvas.height=height;
                ctx.putImageData(dst, 0, 0);
                // 処理結果をデータURLとして取得し、表示
                const processedDataURL = canvas.toDataURL("image/png");
                //canvasの破棄
                delete ctx;
                canvas.height = 0;
                canvas.width = 0;
                canvas.remove();
                resolve(processedDataURL);
            }
        };
    });
}
function replacePixel(data,dst,index,index2,flag=false){
    if(flag||data[index+3]!==0){
        if(Array.isArray(dst)){
            dst[index2]=data[index];
            dst[index2+1]=data[index+1];
            dst[index2+2]=data[index+2];
            dst[index2+3]=data[index+3];
        }else{
            dst.data[index2]=data[index];
            dst.data[index2+1]=data[index+1];
            dst.data[index2+2]=data[index+2];
            dst.data[index2+3]=data[index+3];
        }
    }
}
function pastePixels(data,dst,y1,y2,x1,x2,y3,y4,x3,x4,){
    width=64;
    if((y2-y1)!=(y4-y3)||(x2-x1)!=(x4-x3)){
        console.log((y2-y1),(y4-y3))
        console.log((x2-x1),(x4-x3))
        console.log("pastePixels:l230");
        return;
    }
    for(let y=0;y<y2-y1;y++){
        for(let x=0;x<x2-x1;x++){
            const index1=(((y1+y))*width+(x+x1))*4;
            const index2=(((y3+y))*width+(x+x3))*4;
            replacePixel(data,dst,index2,index1);
        }
    }
}
function resizeimage(data,dst){
    width=64;
    for (let y = 0;y < 32;y++) {//height
        for (let x = 0;x < 64;x++) {//width
            const index = (y * width+x) * 4;
            replacePixel(data,dst,index,index);
        }
    }
    for (let y = 16;y < 32;y++) {//height
        for (let x = 0;x < 16;x++) {//width
            const index = (y * width+x) * 4;
            const index2= ((y+32)*width+(x+16))*4;
            replacePixel(data,dst,index,index2);
        }
    }
    for (let y = 16;y < 32;y++) {//height
        for (let x = 40;x < 56;x++) {//width
            const index = (y * width+x) * 4;
            const index2= ((y+32)*width+(x+16-24))*4;
            replacePixel(data,dst,index,index2);
        }
    }
    return dst;
}
function count_zero(data,y1,x1){
    count=0;
    
    width=64;
    for(let y=y1*q;y<(y1+1)*q;y++){
        for(let x=(x1+3)*q-2;x<(x1+3)*q;x++){
            const index = (y * width+x) * 4;
            if(data[index+3]==0)count++;
        }
    }
    for(let y=(y1+1)*q;y<(y1+4)*q;y++){
        for(let x=(x1+4)*q-2;x<(x1+4)*q;x++){
            const index = (y * width+x) * 4;
            if(data[index+3]==0)count++;
        }
    }
    return count;
}
function isSlim(data){
    count=0;
    count+=count_zero(data,4,10);
    count+=count_zero(data,8,10);
    count+=count_zero(data,12,18);
    count+=count_zero(data,12,12);
    return count>100?true:false;
}
function genFrontImage(data,dst){
    width=64;
    width2=16;
    //face
    for(let y = 8;y<16;y++){
        for(let x=8;x<16;x++){
            const index = (y * width+x) * 4;
            const index2 = ((y-8) * width2+(x-4)) * 4;
            replacePixel(data,dst,index,index2);
        }
    }
    for(let y = 8;y<16;y++){
        for(let x=40;x<48;x++){
            const index = (y * width+x) * 4;
            const index2 = ((y-8) * width2+(x-36)) * 4;
            replacePixel(data,dst,index,index2);
        }
    }
    //body
    for(let y = 20;y<32;y++){
        for(let x=20;x<28;x++){
            const index = (y * width+x) * 4;
            const index2 = ((y-12) * width2+(x-16)) * 4;
            replacePixel(data,dst,index,index2);
        }
    }
    for(let y = 36;y<48;y++){
        for(let x=20;x<28;x++){
            const index = (y * width+x) * 4;
            const index2 = ((y-28) * width2+(x-16)) * 4;
            replacePixel(data,dst,index,index2);
        }
    }
    is=isSlim(data)? 1:0;
    //right arm
    for(let y = 20;y<32;y++){
        for(let x=44;x<48-is;x++){
            const index = (y * width+x) * 4;
            const index2 = ((y-12) * width2+(x-44+is)) * 4;
            replacePixel(data,dst,index,index2);
        }
    }
    for(let y = 36;y<48;y++){
        for(let x=44;x<48-is;x++){
            const index = (y * width+x) * 4;
            const index2 = ((y-28) * width2+(x-44+is)) * 4;
            replacePixel(data,dst,index,index2);
        }
    }
    //left arm
    for(let y = 52;y<64;y++){
        for(let x=36;x<40-is;x++){
            const index = (y * width+x) * 4;
            const index2 = ((y-44) * width2+(x-24)) * 4;
            replacePixel(data,dst,index,index2);
        }
    }
    for(let y = 52;y<64;y++){
        for(let x=52;x<56-is;x++){
            const index = (y * width+x) * 4;
            const index2 = ((y-44) * width2+(x-40)) * 4;
            replacePixel(data,dst,index,index2);
        }
    }
    //right leg
    for(let y = 20;y<32;y++){
        for(let x=4;x<8;x++){
            const index = (y * width+x) * 4;
            const index2 = ((y) * width2+(x)) * 4;
            replacePixel(data,dst,index,index2);
        }
    }
    for(let y = 36;y<48;y++){
        for(let x=4;x<8;x++){
            const index = (y * width+x) * 4;
            const index2 = ((y-16) * width2+(x)) * 4;
            replacePixel(data,dst,index,index2);
        }
    }
    //left leg
    for(let y = 52;y<64;y++){
        for(let x=20;x<24;x++){
            const index = (y * width+x) * 4;
            const index2 = ((y-32) * width2+(x-12)) * 4;
            replacePixel(data,dst,index,index2);
        }
    }
    for(let y = 52;y<64;y++){
        for(let x=4;x<8;x++){
            const index = (y * width+x) * 4;
            const index2 = ((y-32) * width2+(x+4)) * 4;
            replacePixel(data,dst,index,index2);
        }
    }
    return dst;
}
function copy_pixels(data,dst,y1,y2,x1,x2,flag=false){
    width=64;
    for(let y = y1;y<y2;y++){
        for(let x=x1;x<x2;x++){
            const index = (y * width+x) * 4;
            replacePixel(data,dst,index,index,flag);
        }
    }    
}
function rotate1(data,dst,y1,y2,x1,x2){
    width=64;
    for(let y = y1;y<y2;y++){
        for(let x=x1;x<x2;x++){
            const index = (y * width+x) * 4;
            const index2 = ((y2+y1-1-y) * width+(x2+x1-1-x)) * 4;
            replacePixel(data,dst,index,index2);
        }
    }    
}

function flip(data,dst,y1,y2,x1,x2){
    width=64;
    for(let y = y1;y<y2;y++){
        for(let x=x1;x<x2;x++){
            const index = (y * width+x) * 4;
            const index2 = ((y) * width+(x2+x1-1-x)) * 4;
            replacePixel(data,dst,index,index2);
        }
    }    
}
function upsidedown_flip(data,dst,y1,y2,x1,x2){
    width=64;
    for(let y = y1;y<y2;y++){
        for(let x=x1;x<x2;x++){
            const index = (y * width+x) * 4;
            const index2 = ((y2+y1-1-y) * width+(x)) * 4;
            replacePixel(data,dst,index,index2);
        }
    }    
}
function move(data,dst,y1,y2,x1,x2){
    width=64;
    m=x2-x1;
    half_m=m/2;
    for(let y = y1;y<y2;y++){
        for(let x=x1;x<x2;x++){
            const index = (y * width+x) * 4;
            const index2 = (y * width+((x+half_m-x1)%m+x1)) * 4;
            replacePixel(data,dst,index,index2);
        }
    }      
}
function full(dst,y1,y2,x1,x2){
    width=64;
    for(let y = y1;y<y2;y++){
        for(let x=x1;x<x2;x++){
            const index = (y * width+x) * 4;
            dst.data[index]=0;
            dst.data[index+1]=0;
            dst.data[index+2]=0;
            dst.data[index+3]=0;
        }
    }
}

function swapPixel(dst, y1, y2,x1, x2) {
    width=64;
    const index1 = (y1 * width + x1) * 4;
    const index2 = (y2 * width + x2) * 4;
    if(Array.isArray(dst)){
        r1=dst[index1];
        g1=dst[index1+1];
        b1=dst[index1+2];
        a1=dst[index1+3];
        r2=dst[index2];
        g2=dst[index2+1];
        b2=dst[index2+2];
        a2=dst[index2+3];
        dst[index1]=r2
        dst[index1+1]=g2
        dst[index1+2]=b2
        dst[index1+3]=a2
        dst[index2]=r1
        dst[index2+1]=g1
        dst[index2+2]=b1
        dst[index2+3]=a1
    }
    else{
        r1=dst.data[index1];
        g1=dst.data[index1+1];
        b1=dst.data[index1+2];
        a1=dst.data[index1+3];
        r2=dst.data[index2];
        g2=dst.data[index2+1];
        b2=dst.data[index2+2];
        a2=dst.data[index2+3];
        dst.data[index1]=r2
        dst.data[index1+1]=g2
        dst.data[index1+2]=b2
        dst.data[index1+3]=a2
        dst.data[index2]=r1
        dst.data[index2+1]=g1
        dst.data[index2+2]=b1
        dst.data[index2+3]=a1
    }
}
function exchange_limb(dst){
    for(let y = 0;y<16;y++){
        for(let x=0;x<16;x++){
            swapPixel(dst,y+32,y+48,x,x);
            swapPixel(dst,y+16,y+48,x,x+16);
            swapPixel(dst,y+16,y+48,x+40,x+32);
            swapPixel(dst,y+32,y+48,x+40,x+48);
        }
    }     
}
function backwards_head(data,dst){
    width=64;
    
    rotate1(data,dst,0,p,p,2*p);
    rotate1(data,dst,0,p,2*p,3*p);
    rotate1(data,dst,0,p,5*p,6*p);
    rotate1(data,dst,0,p,6*p,7*p);
    move(data,dst,p,2*p,0,4*p);
    move(data,dst,p,2*p,4*p,8*p);
}
function backwards_limb(data,dst,x,y,flag=false){
    
    is=flag?1:0;
    rotate1(data,dst,x*q,(x+1)*q,(y+1)*q,(y+2)*q-is);
    rotate1(data,dst,x*q,(x+1)*q,(y+2)*q-is,(y+3)*q-2*is);
    move(data,dst,(x+1)*q,(x+4)*q,y*q,(y+4)*q-2*is);
}
function backwards_body(data,dst,number,flag=false){
    
    n1=number;
    n2=number+1;
    n3=number+4;
    backwards_limb(data,dst,n1,0);
    backwards_limb(data,dst,n1,10,flag);
    rotate1(data,dst,n1*q,n2*q,5*q,7*q);
    rotate1(data,dst,n1*q,n2*q,7*q,9*q);
    move(data,dst,n2*q,n3*q,4*q,10*q)
}
//前後反転
function backwards(data,dst){
    width=64;
    
    flag=isSlim(data);
    backwards_head(data,dst);
    backwards_body(data,dst,4,flag);
    backwards_body(data,dst,8,flag);
    backwards_limb(data,dst,12,0)
    backwards_limb(data,dst,12,4)
    backwards_limb(data,dst,12,8,flag);
    backwards_limb(data,dst,12,12,flag);
    exchange_limb(dst);
    return dst;
}
function flip_head(data,dst){
    
    flip(data,dst,0,p,p,2*p);
    flip(data,dst,0,p,2*p,3*p);
    flip(data,dst,0,p,5*p,6*p);
    flip(data,dst,0,p,6*p,7*p);

    flip(data,dst,p,2*p,1*p,2*p);
    flip(data,dst,p,2*p,3*p,4*p);
    flip(data,dst,p,2*p,5*p,6*p);
    flip(data,dst,p,2*p,7*p,8*p);

    flip(data,dst,p,2*p,0,p);
    flip(data,dst,p,2*p,2*p,3*p);
    flip(data,dst,p,2*p,4*p,5*p);
    flip(data,dst,p,2*p,6*p,7*p);
    for(let y = p;y<2*p;y++){
        for(let x=0;x<p;x++){
            swapPixel(dst,y,y,x,x+2*p);
            swapPixel(dst,y,y,x+4*p,x+6*p);
        }
    } 
}
function flip_limb(data,dst,x,y,flag=false){
    
    is=flag?1:0;
    flip(data,dst,x*q,(x+1)*q,(y+1)*q,(y+2)*q-is);
    flip(data,dst,x*q,(x+1)*q,(y+2)*q-is,(y+3)*q-2*is);
    flip(data,dst,(x+1)*q,(x+4)*q,(y+1)*q,(y+2)*q-is);
    flip(data,dst,(x+1)*q,(x+4)*q,(y+3)*q-is,(y+4)*q-2*is);
    flip(data,dst,(x+1)*q,(x+4)*q,y*q,(y+1)*q);
    flip(data,dst,(x+1)*q,(x+4)*q,(y+2)*q-is,(y+3)*q-is);
    for(let i=(x+1)*q;i<(x+4)*q;i++){
        for(let j=0;j<q;j++){
            swapPixel(dst,i,i,y*q+j,j+(y+2)*q-is);
        }
    }
}
function flip_body(data,dst,number,flag=false){
    
    n1=number;
    n2=number+1;
    n3=number+4;
    flip_limb(data,dst,n1,0);
    flip_limb(data,dst,n1,10,flag);

    flip(data,dst,n1*q,n2*q,5*q,7*q);
    flip(data,dst,n1*q,n2*q,7*q,9*q);
    flip(data,dst,n2*q,n3*q,5*q,7*q);   
    flip(data,dst,n2*q,n3*q,8*q,10*q);
    flip(data,dst,n2*q,n3*q,4*q,5*q);  
    flip(data,dst,n2*q,n3*q,7*q,8*q);  
    for(let i=n2*q;i<n3*q;i++){
        for(let j=0;j<q;j++){
            swapPixel(dst,i,i,4*q+j,j+7*q);
        }
    }
}
function leftrightflip(data,dst){
    flag=isSlim(data);
    flip_head(data,dst);
    flip_body(data,dst,4,flag);
    flip_body(data,dst,8,flag);
    flip_limb(data,dst,12,0);
    flip_limb(data,dst,12,4);
    flip_limb(data,dst,12,8,flag);
    flip_limb(data,dst,12,12,flag);
    exchange_limb(dst);
    return dst;
}
function midpoint_interpolate(data,dst,axis,y1,y2,x1,x2){
    let index1;
    let index2;
    let index3;
    if(axis==0){
        index1=(y1*width+x1)*4;
        index2=((y2)*width+x2)*4;
        index3=((y2+1)*width+x2)*4;
    }
    else{
        index1=(y1*width+x1)*4;
        index2=((y2)*width+x2)*4;
        index3=((y2)*width+x2+1)*4;
    }
    if(data[index2+3]!=0&&data[index3+3]!=0){
        dst.data[index1]=data[index2]/2.0+data[index3]/2.0;
        dst.data[index1+1]=data[index2+1]/2.0+data[index3+1]/2.0;
        dst.data[index1+2]=data[index2+2]/2.0+data[index3+2]/2.0;
        dst.data[index1+3]=data[index2+3]/2.0+data[index3+3]/2.0;
    }
}
function cut_list(data,dst,axis,y1,y2,x1,x2,y3,y4,x3,x4){
    width=64;
    if((y2-y1)*((1-axis)+1)!=(y4-y3)||(x2-x1)*(1+axis)!=(x4-x3)){
        console.log((y2-y1)*((1-axis)+1),(y4-y3))
        console.log((x2-x1)*(1+axis),(x4-x3))
        console.log("cutlist:654");
        return;
    }
    for(let y=0;y<y2-y1;y++){
        for(let x=0;x<x2-x1;x++){
            const index1=(((y1+y))*width+(x+x1))*4;
            const index2=axis==0?(((y3+2*y))*width+(x+x3))*4:(((y3+y))*width+(2*x+x3))*4
            const index3=axis==0?(((y3+2*y+1))*width+(x+x3))*4:(((y3+y))*width+(2*x+x3+1))*4
            replacePixel(data,dst,index2,index1);
            if(data[index2+3]!=0&&data[index3+3]!=0){
                if(Array.isArray(dst)){
                    dst[index1]=data[index2]/2.0+data[index3]/2.0;
                    dst[index1+1]=data[index2+1]/2.0+data[index3+1]/2.0;
                    dst[index1+2]=data[index2+2]/2.0+data[index3+2]/2.0;
                    dst[index1+3]=data[index2+3]/2.0+data[index3+3]/2.0;
                }else{
                    dst.data[index1]=data[index2]/2.0+data[index3]/2.0;
                    dst.data[index1+1]=data[index2+1]/2.0+data[index3+1]/2.0;
                    dst.data[index1+2]=data[index2+2]/2.0+data[index3+2]/2.0;
                    dst.data[index1+3]=data[index2+3]/2.0+data[index3+3]/2.0;
                }
                
            }
        }
    }
}
function buttom_side(dst,y1,x1,p,q,r){
    width=64;
    for(let y=y1;y<y1+p/2;y++){
        for(let x=x1+p+q;x<x1+p+2*q;x++){
            index2=(y*width+x)*4;
            index1=((y1+p+r-1)*width+(x1+2*p+2*q-1-(x-x1-p-q)))*4;
            replacePixel(dst.data,dst,index1,index2);
        }
    }
    for(let y=y1+p/2;y<y1+p;y++){
        for(let x=x1+p+q;x<x1+p+2*q;x++){
            index2=(y*width+x)*4;
            index1=((y1+p+r-1)*width+(x1+p+(x-x1-p-q)))*4;
            replacePixel(dst.data,dst,index1,index2);
        }
    }
    for(let y=y1;y<y1+p;y++){
        for(let x=x1+p+q;x<x1+p+q+2;x++){
            index2=(y*width+x)*4;
            index1=((y1+p+r-1)*width+(x1+(y-y1)))*4;
            replacePixel(dst.data,dst,index1,index2);
        }
    }
    for(let y=y1;y<y1+p;y++){
        for(let x=x1+p+2*q-2;x<x1+p+2*q;x++){
            index2=(y*width+x)*4;
            index1=((y1+p+r-1)*width+(x1+2*p+q-1-(y-y1)))*4;
            replacePixel(dst.data,dst,index1,index2);
        }
    }
}
function top_side(dst,y1,x1,p,q){
    width=64;
    for(let y=y1;y<y1+p/2;y++){
        for(let x=x1+p;x<x1+p+q;x++){
            index2=(y*width+x)*4;
            index1=((y1+p)*width+(x1+2*p+2*q-1-(x-x1-p)))*4;
            replacePixel(dst.data,dst,index1,index2);
        }
    }
    for(let y=y1+p/2;y<y1+p;y++){
        for(let x=x1+p;x<x1+p+q;x++){
            index2=(y*width+x)*4;
            index1=((y1+p)*width+(x1+p+(x-x1-p)))*4;
            replacePixel(dst.data,dst,index1,index2);
        }
    }
    for(let y=y1;y<y1+p;y++){
        for(let x=x1+p;x<x1+p+2;x++){
            index2=(y*width+x)*4;
            index1=((y1+p)*width+(x1+(y-y1)))*4;
            replacePixel(dst.data,dst,index1,index2);
        }
    }
    for(let y=y1;y<y1+p;y++){
        for(let x=x1+p+q-2;x<x1+p+q;x++){
            index2=(y*width+x)*4;
            index1=((y1+p)*width+(x1+2*p+q-1-(y-y1)))*4;
            replacePixel(dst.data,dst,index1,index2);
        }
    }
}
function exchange_upsidedown(dst){
    const copyed=Array.from(dst.data);
    full(dst,0,64,0,64);
    
    copy_pixels(copyed,dst,48,64,32,48);
    copy_pixels(copyed,dst,48,64,48,64);
    copy_pixels(copyed,dst,16,32,40,56);
    copy_pixels(copyed,dst,32,48,40,56);
    width=64;
    //下位レイヤー
    //頭の上面と足の底面
    for(let i=0;i<q;i++){
        for(let j=0;j<q;j++){
            let index1 = ((i+4*q) * width+q+j) * 4;
            let index2 = ((2*i) * width+p+j) * 4;
            let index3 = ((2*i+1) * width+p+j) * 4;
            replacePixel(copyed,dst,index1,index2);
            replacePixel(copyed,dst,index1,index3);
            midpoint_interpolate(copyed,dst,0,4*q+i,2*i,2*q+j,2*p+j);
            index1 = ((i+12*q) * width+5*q+j) * 4;
            index2 = ((2*i) * width+p+q+j) * 4;
            index3 = ((2*i+1) * width+p+q+j) * 4;
            replacePixel(copyed,dst,index1,index2);
            replacePixel(copyed,dst,index1,index3);
            midpoint_interpolate(copyed,dst,0,12*q+i,2*i,6*q+j,2*p+q+j);
        }
    }
    //頭の側面と足の側面
    for(let i=0;i<2*q;i++){
        for(let j=0;j<q;j++){
            index1 = ((i+5*q) * width+j) * 4;
            index2 = ((i+p) * width+2*j) * 4;
            index3 = ((i+p) * width+1+2*j) * 4;
            replacePixel(copyed,dst,index1,index2);
            replacePixel(copyed,dst,index1,index3);
            midpoint_interpolate(copyed,dst,1,5*q+4+i,p+i,j,2*j)
            index1 = ((i+13*q) * width+6*q+j) * 4;
            index2 = ((i+p) * width+2*j+2*p) * 4;
            index3 = ((i+p) * width+1+2*j+2*p) * 4;
            replacePixel(copyed,dst,index1,index2);
            replacePixel(copyed,dst,index1,index3);
            midpoint_interpolate(copyed,dst,1,13*q+4+i,p+i,6*q+j,2*j+2*p)
        }
    }
    pastePixels(copyed,dst,p,2*p,p,p+q,5*q,7*q,q,2*q);
    pastePixels(copyed,dst,5*q+4,7*q+4,q,2*q,p,2*p,p,p+q);
    pastePixels(copyed,dst,p,2*p,p+q,2*p,13*q,15*q,5*q,6*q);
    pastePixels(copyed,dst,13*q+4,15*q+4,5*q,6*q,p,2*p,p+q,2*p);
    pastePixels(copyed,dst,p,2*p,3*p,3*p+q,13*q,15*q,7*q,8*q);
    pastePixels(copyed,dst,13*q+4,15*q+4,7*q,8*q,p,2*p,3*p,3*p+q);
    pastePixels(copyed,dst,p,2*p,3*p+q,4*p,5*q,7*q,3*q,4*q);
    pastePixels(copyed,dst,5*q+4,7*q+4,3*q,4*q,p,2*p,3*p+q,4*p);
    //上位レイヤー
    //頭の上面と足の底面
    for(let i=0;i<q;i++){
        for(let j=0;j<q;j++){
             index1 = ((i+8*q) * width+q+j) * 4;
             index2 = ((2*i) * width+5*p+j) * 4;
             index3 = ((2*i+1) * width+5*p+j) * 4;
            replacePixel(copyed,dst,index1,index2);
            replacePixel(copyed,dst,index1,index3);
            midpoint_interpolate(copyed,dst,0,8*q+i,2*i,2*q+j,6*p+j);
            index1 = ((i+12*q) * width+q+j) * 4;
            index2 = ((2*i) * width+5*p+q+j) * 4;
            index3 = ((2*i+1) * width+5*p+q+j) * 4;
            replacePixel(copyed,dst,index1,index2);
            replacePixel(copyed,dst,index1,index3);
            midpoint_interpolate(copyed,dst,0,12*q+i,2*i,2*q+j,6*p+q+j);
        }
    }
    //頭の側面と足の側面
    for(let i=0;i<2*q;i++){
        for(let j=0;j<q;j++){
            index1 = ((i+9*q) * width+j) * 4;
            index2 = ((i+p) * width+2*j+4*p) * 4;
            index3 = ((i+p) * width+1+2*j+4*p) * 4;
            replacePixel(copyed,dst,index1,index2);
            replacePixel(copyed,dst,index1,index3);
            midpoint_interpolate(copyed,dst,1,9*q+4+i,p+i,j,2*j+4*p)
            index1 = ((i+13*q) * width+2*q+j) * 4;
            index2 = ((i+p) * width+2*j+6*p) * 4;
            index3 = ((i+p) * width+1+2*j+6*p) * 4;
            replacePixel(copyed,dst,index1,index2);
            replacePixel(copyed,dst,index1,index3);
            midpoint_interpolate(copyed,dst,1,13*q+4+i,p+i,2*q+j,2*j+6*p)
        }
    }
    pastePixels(copyed,dst, p, 2*p, 5*p, 5*p+q, 9*q, 11*q, q, 2*q);
    pastePixels(copyed, dst,  9*q+4, 11*q+4, q, 2*q, p, 2*p, 5*p, 5*p+q);
    pastePixels(copyed, dst,  p, 2*p, 5*p+q, 6*p, 13*q, 15*q, q, 2*q);
    pastePixels(copyed, dst, 13*q+4, 15*q+4, q, 2*q, p, 2*p, 5*p+q, 6*p);
    pastePixels(copyed, dst, p, 2*p, 7*p, 7*p+q, 13*q, 15*q, 3*q, 4*q);
    pastePixels(copyed, dst, 13*q+4, 15*q+4, 3*q, 4*q, p, 2*p, 7*p, 7*p+q);
    pastePixels(copyed, dst,  p, 2*p, 7*p+q, 8*p, 9*q, 11*q, 3*q, 4*q);
    pastePixels(copyed, dst, 9*q+4, 11*q+4, 3*q, 4*q, p, 2*p, 7*p+q, 8*p);
    //

    pastePixels(copyed,dst,5*q,6*q,4*q,6*q,7*q,8*q,0,2*q);
    pastePixels(copyed,dst,5*q,6*q,0,2*q,7*q,8*q,4*q,6*q);
    pastePixels(copyed,dst,5*q,6*q,9*q,10*q,7*q,8*q,3*q,4*q);
    pastePixels(copyed,dst,5*q,6*q,3*q,4*q,7*q,8*q,9*q,10*q);
    pastePixels(copyed,dst,5*q,6*q,6*q,9*q,15*q,16*q,5*q,8*q);
    pastePixels(copyed,dst,13*q,14*q,5*q,8*q,7*q,8*q,6*q,9*q);
    pastePixels(copyed,dst,6*q,8*q,4*q,10*q,5*q,7*q,4*q,10*q);
    pastePixels(copyed,dst,10*q,12*q,4*q,10*q,9*q,11*q,4*q,10*q);

    pastePixels(copyed,dst,9*q,10*q,4*q,6*q,11*q,12*q,0,2*q);
    pastePixels(copyed,dst,9*q,10*q,0,2*q,11*q,12*q,4*q,6*q);
    pastePixels(copyed,dst,9*q,10*q,9*q,10*q,11*q,12*q,3*q,4*q);
    pastePixels(copyed,dst,9*q,10*q,3*q,4*q,11*q,12*q,9*q,10*q);
    pastePixels(copyed,dst,9*q,10*q,6*q,9*q,15*q,16*q,q,4*q);
    pastePixels(copyed,dst,13*q,14*q,q,4*q,11*q,12*q,6*q,9*q);

    buttom_side(dst,0,0,8,8,8);
    buttom_side(dst,0,32,8,8,8);
    top_side(dst,16,16,4,8);
    top_side(dst,32,16,4,8);
    buttom_side(dst,16,16,4,8,12);
    buttom_side(dst,32,16,4,8,12);
    top_side(dst,16,0,4,4);
    top_side(dst,32,0,4,4);
    top_side(dst,48,0,4,4);
    top_side(dst,48,16,4,4);
}
function compress(data,dst,x,y,size,flag=true){
    width=64;
    if(flag){
        for(let i=0;i<8;i++){
            n=(x+4)*q-1-Math.floor((12.0*i)/8.0);
            k=(x+4)*q-1-i;
            a=12.0*i/8.0-Math.floor((12.0*i)/8.0);
            for(let j=0;j<size;j++){
                const index1=((n)*width+y*q+j)*4;
                const index2=((n-1)*width+y*q+j)*4;
                const index3=(k*width+y*q+j)*4;
                if(data[index1+3]!=0&&data[index2+3]!=0&&(1-a)*data[index1+3]+a*data[index2+3]>127){
                    if(Array.isArray(dst)){
                        dst[index3]=(1-a)*data[index1]+a*data[index2];
                        dst[index3+1]=(1-a)*data[index1+1]+a*data[index2+1];
                        dst[index3+2]=(1-a)*data[index1+2]+a*data[index2+2];
                        dst[index3+3]=(1-a)*data[index1+3]+a*data[index2+3];
                    }else{
                        dst.data[index3]=(1-a)*data[index1]+a*data[index2];
                        dst.data[index3+1]=(1-a)*data[index1+1]+a*data[index2+1];
                        dst.data[index3+2]=(1-a)*data[index1+2]+a*data[index2+2];
                        dst.data[index3+3]=(1-a)*data[index1+3]+a*data[index2+3];
                    }
                }
            }
        }
    }
    else{
        for(let i=0;i<8;i++){
            n=(x+1)*q+Math.floor((12.0*i)/8.0);
            k=(x+1)*q+i;
            a=12.0*i/8.0-Math.floor((12.0*i)/8.0);
            for(let j=0;j<size;j++){
                const index1=((n)*width+y*q+j)*4;
                const index2=((n+1)*width+y*q+j)*4;
                const index3=(k*width+y*q+j)*4;
                if(data[index1+3]!=0&&data[index2+3]!=0&&(1-a)*data[index1+3]+a*data[index2+3]>127){
                    if(Array.isArray(dst)){
                        dst[index3]=(1-a)*data[index1]+a*data[index2];
                        dst[index3+1]=(1-a)*data[index1+1]+a*data[index2+1];
                        dst[index3+2]=(1-a)*data[index1+2]+a*data[index2+2];
                        dst[index3+3]=(1-a)*data[index1+3]+a*data[index2+3];
                    }else{
                        dst.data[index3]=(1-a)*data[index1]+a*data[index2];
                        dst.data[index3+1]=(1-a)*data[index1+1]+a*data[index2+1];
                        dst.data[index3+2]=(1-a)*data[index1+2]+a*data[index2+2];
                        dst.data[index3+3]=(1-a)*data[index1+3]+a*data[index2+3];
                    }
                }
            }
        }        
    }
}
function lifting_skin(data,dst){
    flag=isSlim(data);
    upsidedown_limb(data,dst,12,8,flag);
    upsidedown_limb(data,dst,12,12,flag);
    upsidedown_limb(data,dst,4,10,flag);
    upsidedown_limb(data,dst,8,10,flag);
    compress(data,dst,4,0,16)
    compress(data,dst,8,0,16)
    compress(data,dst,12,0,16)
    compress(data,dst,12,4,16)
    const arr=Array(64*64*4).fill(0);
    compress(data,arr,4,4,24);//胴体
    compress(data,arr,8,4,24);//胴体

    pastePixels(arr,dst,5*q,5*q+4,0,2*q,28,32,16,24);
    pastePixels(arr,dst,5*q,5*q+4,3*q,4*q,28,32,36,40);
    pastePixels(arr,dst,13*q,13*q+4,5*q,8*q,28,32,24,36);

    pastePixels(arr,dst,9*q,9*q+4,0,2*q,44,48,16,24);
    pastePixels(arr,dst,9*q,9*q+4,3*q,4*q,44,48,36,40);
    pastePixels(arr,dst,13*q,13*q+4,1*q,4*q,44,48,24,36);

    pastePixels(arr,dst,28,32,16,40,24,28,16,40);
    pastePixels(arr,dst,44,48,16,40,40,44,16,40);

    cut_list(data,dst,1,5*q,7*q,4*q,5*q,p,2*p,0,p);
    pastePixels(data,dst,5*q,7*q,5*q,7*q,p,2*p,p,2*p);
    cut_list(data,dst,1,5*q,7*q,7*q,8*q,p,2*p,2*p,3*p);
    pastePixels(data,dst,5*q,7*q,8*q,10*q,p,2*p,3*p,4*p);
    cut_list(data,dst,0,4*q,5*q,5*q,7*q,0,p,p,2*p);

    cut_list(data,dst,1,9*q,11*q,4*q,5*q,p,2*p,4*p,5*p);
    pastePixels(data,dst,9*q,11*q,5*q,7*q,p,2*p,5*p,6*p);
    cut_list(data,dst,1,9*q,11*q,7*q,8*q,p,2*p,6*p,7*p);
    pastePixels(data,dst,9*q,11*q,8*q,10*q,p,2*p,7*p,8*p);
    cut_list(data,dst,0,8*q,9*q,5*q,7*q,0,p,5*p,6*p);
    
    buttom_side(dst,16,16,4,8,12);
    buttom_side(dst,32,16,4,8,12);
    top_side(dst,16,0,4,4);
    top_side(dst,32,0,4,4);
    top_side(dst,48,0,4,4);
    top_side(dst,48,16,4,4);

    copy_pixels(data,dst,16,20,8,12);
    copy_pixels(data,dst,32,36,8,12);
    copy_pixels(data,dst,48,52,8,12);
    copy_pixels(data,dst,48,52,24,28);
    
    pastePixels(dst.data,dst,5*q,6*q,2*q,3*q,13*q,14*q,5*q,6*q)
    pastePixels(dst.data,dst,9*q,10*q,2*q,3*q,13*q,14*q,1*q,2*q)
    pastePixels(dst.data,dst,13*q,14*q,4*q,5*q,5*q,6*q,1*q,2*q)
    pastePixels(dst.data,dst,13*q,14*q,0*q,1*q,9*q,10*q,1*q,2*q)

    return dst;
}
function trampling_skin(data,dst){
    const arr=Array(64*64*4).fill(0);
    copy_pixels(data,dst,0,16,0,64);
    copy_pixels(data,dst,16,48,40,56);
    copy_pixels(data,dst,48,64,32,64);
    copy_pixels(data,dst,16,20,20,28);
    copy_pixels(data,dst,32,36,20,28);
    compress(data,arr,4,0,16,flag=false)
    compress(data,arr,8,0,16,flga=false)
    compress(data,arr,12,0,16,flag=false)
    compress(data,arr,12,4,16,flag=false)
    
    pastePixels(arr,dst,28,32,16,24,20,24,0,8);
    pastePixels(arr,dst,28,32,36,40,20,24,12,16);
    pastePixels(arr,dst,28,32,24,36,52,56,20,32);

    pastePixels(arr,dst,44,48,16,24,36,40,0,8);
    pastePixels(arr,dst,44,48,36,40,36,40,12,16);
    pastePixels(arr,dst,44,48,24,36,52,56,0,12);

    compress(data,dst,4,4,24,flag=false);
    compress(data,dst,8,4,24,flag=false);

    buttom_side(dst,16,16,4,8,12);
    buttom_side(dst,32,16,4,8,12);

    pastePixels(arr,dst,20,24,0,16,24,28,0,16);
    pastePixels(arr,dst,36,40,0,16,40,44,0,16);
    pastePixels(arr,dst,52,56,0,16,56,60,0,16);
    pastePixels(arr,dst,52,56,16,32,56,60,16,32);

    top_side(dst,16,0,4,4);
    top_side(dst,32,0,4,4);
    top_side(dst,48,0,4,4);
    top_side(dst,48,16,4,4);
    return dst;
}
function upsidedown_head(data,dst){
    
    copy_pixels(data,dst,0,p,p,3*p);
    copy_pixels(data,dst,0,p,5*p,7*p);
    for(let i=0;i<p;i++){
        for(let j=0;j<p;j++){
            swapPixel(dst,i,i,p+j,j+2*p);
            swapPixel(dst,i,i,5*p+j,j+6*p);
        }
    }
    upsidedown_flip(data,dst,p,2*p,0,4*p);
    upsidedown_flip(data,dst,p,2*p,4*p,8*p);
}
function upsidedown_limb(data,dst,x,y,flag=false){
    is=flag?1:0;
    
    copy_pixels(data,dst,x*q,(x+1)*q,(y+2)*q-is,(y+3)*q-2*is);
    copy_pixels(data,dst,x*q,(x+1)*q,(y+1)*q,(y+2)*q-is);
    for(let i=0;i<q;i++){
        for(let j=0;j<q-is;j++){
            swapPixel(dst,x*q+i,x*q+i,(y+1)*q+j,j+(y+2)*q-is);
        }
    }
    upsidedown_flip(data,dst,(x+1)*q,(x+4)*q,y*q,(y+4)*q);
}
function upsidedown_body(data,dst,number,flag=false){
    
    n1=number;
    n2=number+1;
    n3=number+4;
    upsidedown_limb(data,dst,n1,0);
    upsidedown_limb(data,dst,n1,10,flag);

    copy_pixels(data,dst,n1*q,n2*q,7*q,9*q);
    copy_pixels(data,dst,n1*q,n2*q,5*q,7*q);
    for(let i=0;i<q;i++){
        for(let j=0;j<2*q;j++){
            swapPixel(dst,n1*q+i,n1*q+i,5*q+j,j+7*q);
        }
    }
    upsidedown_flip(data,dst,n2*q,n3*q,4*q,10*q);
}
function upsidedown(data,dst){
    flag=isSlim(data);
    upsidedown_head(data,dst);
    upsidedown_body(data,dst,4,flag);
    upsidedown_body(data,dst,8,flag);
    upsidedown_limb(data,dst,12,0);
    upsidedown_limb(data,dst,12,4);
    upsidedown_limb(data,dst,12,8,flag);
    upsidedown_limb(data,dst,12,12,flag);
    exchange_upsidedown(dst);
    return dst;
}
function rotate(data,dst,y1,y2,x1,x2,deg){
    width=64;
    //pastePixels(data,dst,y1,y2,x1,x2,y1,y2,x1,x2);
    for(let y = y1;y<y2;y++){
        for(let x=x1;x<x2;x++){
            const index = (y * width+x) * 4;
            const index2 = deg==1?((y2-1-x+x1) * width+(x1+y-y1)) * 4:((y1+(x-x1)) * width+(x2-1-y+y1)) * 4;
            //swapPixel(dst,index,index2);
            replacePixel(data,dst,index,index2)
        }
    }
  
}
function slim2wideparts(data,dst,y,x){
    copy_pixels(data,dst,y,y+16,x,x+6);
    pastePixels(data,dst,y,y+16,x+6,x+7,y,y+16,x+5,x+6);
    pastePixels(data,dst,y,y+16,x+7,x+8,y,y+16,x+6,x+7);

    pastePixels(data,dst,y+4,y+16,x+8,x+12,y+4,y+16,x+7,x+11);
    pastePixels(data,dst,y,y+4,x+8,x+10,y,y+4,x+7,x+9);
    pastePixels(data,dst,y,y+4,x+10,x+11,y,y+4,x+8,x+9);
    pastePixels(data,dst,y,y+4,x+11,x+12,y,y+4,x+9,x+10);

    pastePixels(data,dst,y+4,y+16,x+12,x+14,y+4,y+16,x+11,x+13);
    pastePixels(data,dst,y+4,y+16,x+14,x+15,y+4,y+16,x+12,x+13);
    pastePixels(data,dst,y+4,y+16,x+15,x+16,y+4,y+16,x+13,x+14);
}
function slim2wide(data,dst){
    copy_pixels(data,dst,0,16,0,64);
    copy_pixels(data,dst,16,48,0,40);
    copy_pixels(data,dst,48,64,0,32);
    slim2wideparts(data,dst,16,40);
    slim2wideparts(data,dst,32,40);

    slim2wideparts(data,dst,48,32);
    slim2wideparts(data,dst,48,48);
    return dst;
}
function wide2slimparts(data,dst,y,x){
    copy_pixels(data,dst,y,y+16,x,x+6);
    pastePixels(data,dst,y,y+16,x+6,x+7,y,y+16,x+7,x+8);
    pastePixels(data,dst,y,y+4,x+7,x+9,y,y+4,x+8,x+10);
    pastePixels(data,dst,y,y+4,x+9,x+10,y,y+4,x+11,x+12);

    pastePixels(data,dst,y+4,y+16,x+7,x+11,y+4,y+16,x+8,x+12);
    pastePixels(data,dst,y+4,y+16,x+11,x+13,y+4,y+16,x+12,x+14);
    pastePixels(data,dst,y+4,y+16,x+13,x+14,y+4,y+16,x+15,x+16);

}
function wide2slim(data,dst){
    copy_pixels(data,dst,0,16,0,64);
    copy_pixels(data,dst,16,48,0,40);
    copy_pixels(data,dst,48,64,0,32);
    wide2slimparts(data,dst,16,40);
    wide2slimparts(data,dst,32,40);

    wide2slimparts(data,dst,48,32);
    wide2slimparts(data,dst,48,48);
    return dst;
    
}
function head_rotate_layer(data,dst,y){
    
    let arr0 = Array(64*16*4).fill(0);
    rotate(data,arr0,p,2*p,y+p,y+2*p,-1);//正面が時計回りに回転
    rotate(data,arr0,0,p,y+2*p,y+3*p,1);//2//下から左へ
    rotate(data,arr0,0,p,y+p,y+2*p,-1);//4//上から右へ
    rotate(data,arr0,p,2*p,y+3*p,y+4*p,1);//5 半対面が反時計回りに回転 
    rotate(data,arr0,p,2*p,y,y+p,-1);//6 左から上へ
    rotate(data,arr0,p,2*p,y+2*p,y+3*p,1);//7 右から下へ

    let arr = Array(64*16*4).fill(0);
    upsidedown_flip(arr0,arr,0,p,y+2*p,y+3*p);//3//右から下へ
    flip(arr0,arr,p,2*p,y+2*p,y+3*p);
    pastePixels(arr0,arr,0,p,y+p,y+2*p,0,p,y+p,y+2*p);
    pastePixels(arr0,arr,p,2*p,y+3*p,y+4*p,p,2*p,y+3*p,y+4*p);
    pastePixels(arr0,arr,p,2*p,y,y+p,p,2*p,y,y+p);
    pastePixels(arr0,arr,p,2*p,y+p,y+2*p,p,2*p,y+p,y+2*p);
    //ここまでで向きを揃える
    pastePixels(arr,dst,p,2*p,y,y+p,0,p,y+2*p,y+3*p);//下
    pastePixels(arr,dst,p,2*p,y+2*p,y+3*p,0,p,y+1*p,y+2*p);//上
    pastePixels(arr,dst,0,p,y+1*p,y+2*p,p,2*p,y,y+p);//左
    pastePixels(arr,dst,0,p,y+2*p,y+3*p,p,2*p,y+2*p,y+3*p);//右
    pastePixels(arr,dst,p,2*p,y+p,y+2*p,p,2*p,y+p,y+2*p);
    pastePixels(arr,dst,p,2*p,y+3*p,y+4*p,p,2*p,y+3*p,y+4*p)
    pastePixels(data,dst,16,64,0,64,16,64,0,64);
}
function head_rotate(data,dst){
    head_rotate_layer(data,dst,0);
    head_rotate_layer(data,dst,32);
    return dst;
}
function head_rotate_inverse(data,dst){
    arr=Array(64*64*4).fill(0);
    arr2=Array(64*64*4).fill(0);
    head_rotate(data,arr);
    head_rotate(arr,arr2);
    head_rotate(arr2,dst);
    return dst;
}
function head_rotate_layer_vertical(data,dst,x){
    
    rotate(data,dst,0,p,x+p,x+2*p,1);
    rotate(data,dst,0,p,x+2*p,x+3*p,1);
    pastePixels(data,dst,p,2*p,x+p,x+4*p,p,2*p,x,x+3*p)
    pastePixels(data,dst,p,2*p,x,x+p,p,2*p,x+3*p,x+4*p);
}
function head_rotate_layer_horizontal(data,dst,x){
    pastePixels(data,dst,16,64,0,64,16,64,0,64);
    arr=Array(64*64*4).fill(0);
    rotate1(data,arr,0,8,x+8,x+16);
    upsidedown_flip(data,arr,0,8,x+16,x+24);
    rotate(data,arr,8,16,x,x+8,1);
    rotate(data,arr,8,16,x+16,x+24,-1);
    flip(data,arr,8,16,x+24,x+32,1);
    copy_pixels(data,arr,8,16,x+8,x+16);
    //ここまで回転
    pastePixels(arr,dst,0,8,x+8,x+16,8,16,x+8,x+16);
    pastePixels(arr,dst,8,16,x+8,x+16,0,8,x+16,x+24);
    pastePixels(arr,dst,0,8,x+16,x+24,8,16,x+24,x+32);
    pastePixels(arr,dst,8,16,x+24,x+32,0,8,x+8,x+16);
    copy_pixels(arr,dst,8,16,x,x+8);
    copy_pixels(arr,dst,8,16,x+16,x+24);
}
function head_rotate_horizontal(data,dst){
    pastePixels(data,dst,16,64,0,64,16,64,0,64);
    head_rotate_layer_horizontal(data,dst,0);
    head_rotate_layer_horizontal(data,dst,32);
    return dst;
}
function head_rotate_horizontal_inverse(data,dst){
    const arr=Array(64*64*4).fill(0);
    const arr2=Array(64*64*4).fill(0);
    head_rotate_horizontal(data,arr);
    head_rotate_horizontal(arr,arr2);
    head_rotate_horizontal(arr2,dst);
    return dst;
}
function head_rotate_vertical(data,dst){
    pastePixels(data,dst,16,64,0,64,16,64,0,64);
    head_rotate_layer_vertical(data,dst,0);
    head_rotate_layer_vertical(data,dst,32);
    return dst;
}
function head_rotate_vertical_inverse(data,dst){
    arr=Array(64*64*4).fill(0);
    arr2=Array(64*64*4).fill(0);
    head_rotate_vertical(data,arr);
    head_rotate_vertical(arr,arr2);
    head_rotate_vertical(arr2,dst);
    return dst;
}
function bring_one_internal_layer(data,dst){
    copy_pixels(data,dst,0,16,0,32);
    copy_pixels(data,dst,16,32,0,56);
    copy_pixels(data,dst,48,64,16,48);
    pastePixels(data,dst,0,16,0,32,0,16,32,64);
    pastePixels(data,dst,16,32,0,56,32,48,0,56);
    pastePixels(data,dst,48,64,16,32,48,64,0,16);
    pastePixels(data,dst,48,64,32,48,48,64,48,64);
    return dst;
}
function bring_one_external_layer(data,dst){
    pastePixels(data,dst,0,16,32,64,0,16,0,32);
    pastePixels(data,dst,32,48,0,56,16,32,0,56);
    pastePixels(data,dst,48,64,0,16,48,64,16,32);
    pastePixels(data,dst,48,64,48,64,48,64,32,48);
    copy_pixels(data,dst,0,16,32,64);
    copy_pixels(data,dst,32,48,0,56);
    copy_pixels(data,dst,48,64,0,16);
    copy_pixels(data,dst,48,64,48,64);
    return dst;
}
function toGray(data,dst){
    for(let i=0;i<64;i++){
        for(let j=0;j<64;j++){
            const index=(i*64+j)*4;
            const r=data[index];
            const g=data[index+1];
            const b=data[index+2];
            const a=data[index+3];
            const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            dst.data[index]=gray;
            dst.data[index+1]=gray;
            dst.data[index+2]=gray;
            dst.data[index+3]=a;
        }
    }
    return dst;
}
function toSepia(data,dst){
    for(let i=0;i<64;i++){
        for(let j=0;j<64;j++){
            const index=(i*64+j)*4;
            const r=data[index];
            const g=data[index+1];
            const b=data[index+2];
            const a=data[index+3];
            const new_r = (r * .393) + (g * .769) + (b * .189)
            const new_g = (r * .349) + (g * .686) + (b * .168)
            const new_b = (r * .272) + (g * .534) + (b * .131)
            dst.data[index]=new_r;
            dst.data[index+1]=new_g;
            dst.data[index+2]=new_b;
            dst.data[index+3]=a;
        }
    }
    return dst;
}
function toNegative(data,dst){
    for(let i=0;i<64;i++){
        for(let j=0;j<64;j++){
            const index=(i*64+j)*4;
            const r=data[index];
            const g=data[index+1];
            const b=data[index+2];
            const a=data[index+3];
            dst.data[index]=255-r;
            dst.data[index+1]=255-g;
            dst.data[index+2]=255-b;
            dst.data[index+3]=a;
        }
    }
    return dst;

}
function erase_margin(data,dst){
    copy_pixels(data,dst,0,64,0,64);
    const arr1=Array(64*64*4).fill(0);
    copy_pixels(arr1,dst,0,8,0,8,flag=true);
    copy_pixels(arr1,dst,0,8,24,40,flag=true);
    copy_pixels(arr1,dst,0,8,56,64,flag=true);
    copy_pixels(arr1,dst,16,20,0,4,flag=true);
    copy_pixels(arr1,dst,16,20,12,20,flag=true);
    copy_pixels(arr1,dst,16,20,36,44,flag=true);
    copy_pixels(arr1,dst,16,20,52,56,flag=true);
    copy_pixels(arr1,dst,32,36,0,4,flag=true);
    copy_pixels(arr1,dst,32,36,12,20,flag=true);
    copy_pixels(arr1,dst,32,36,36,44,flag=true);
    copy_pixels(arr1,dst,32,36,52,56,flag=true);
    copy_pixels(arr1,dst,16,48,56,64,flag=true);
    copy_pixels(arr1,dst,48,52,0,4,flag=true);
    copy_pixels(arr1,dst,48,52,12,20,flag=true);
    copy_pixels(arr1,dst,48,52,28,36,flag=true);
    copy_pixels(arr1,dst,48,52,44,52,flag=true);
    copy_pixels(arr1,dst,48,52,60,64,flag=true);
    return dst;
}
function toComplement(data,dst){
    for(let i=0;i<64;i++){
        for(let j=0;j<64;j++){
            const index=(i*64+j)*4;
            const r=data[index];
            const g=data[index+1];
            const b=data[index+2];
            const a=data[index+3];
            const max=Math.max(r,g,b);
            const min=Math.min(r,g,b);
            dst.data[index]=max+min-r;
            dst.data[index+1]=max+min-g;
            dst.data[index+2]=max+min-b;
            dst.data[index+3]=a;
        }
    }
    return dst;
}
function replace_head(data,data2,dst){
    copy_pixels(data,dst,16,64,0,64);
    copy_pixels(data2,dst,0,16,0,64);
    return dst;
}
function replace_leg(data,data2,dst){
    copy_pixels(data,dst,0,64,0,64);
    const arr=Array(64*64*4).fill(0);
    copy_pixels(arr,dst,16,20,8,12);
    copy_pixels(arr,dst,24,32,0,16);
    copy_pixels(arr,dst,32,36,8,12);
    copy_pixels(arr,dst,40,48,0,16);
    copy_pixels(arr,dst,48,52,8,12);
    copy_pixels(arr,dst,56,64,0,16);
    copy_pixels(arr,dst,48,52,24,28);
    copy_pixels(arr,dst,56,64,16,32);

    cut_list(data2,dst,0,4*q,5*q,2*q,3*q,0,p,2*p,2*p+q);
    cut_list(data2,dst,0,12*q,13*q,6*q,7*q,0,p,2*p+q,3*p);
    cut_list(data2,dst,1,5*q+4,7*q+4,0,q,p,2*p,0,p);
    pastePixels(data2,dst,5*q+4,7*q+4,q,2*q,p,2*p,p,p+q);
    
    pastePixels(data2,dst,13*q+4,15*q+4,5*q,6*q,p,2*p,p+q,2*p);
    cut_list(data2,dst,1,13*q+4,15*q+4,6*q,7*q,p,2*p,2*p,3*p);
    pastePixels(data2,dst,13*q+4,15*q+4,7*q,8*q,p,2*p,3*p,3*p+q);
    pastePixels(data2,dst,5*q+4,7*q+4,3*q,4*q,p,2*p,3*p+q,4*p);

    cut_list(data2,dst,0,8*q,9*q,2*q,3*q,0,p,6*p,6*p+q);
    cut_list(data2,dst,0,12*q,13*q,2*q,3*q,0,p,6*p+q,7*p);
    cut_list(data2,dst,1,9*q+4,11*q+4,0,q,p,2*p,4*p,5*p);
    pastePixels(data2,dst,9*q+4,11*q+4,q,2*q,p,2*p,5*p,5*p+q);
    
    pastePixels(data2,dst,13*q+4,15*q+4,q,2*q,p,2*p,5*p+q,6*p);
    cut_list(data2,dst,1,13*q+4,15*q+4,2*q,3*q,p,2*p,6*p,7*p);
    pastePixels(data2,dst,13*q+4,15*q+4,3*q,4*q,p,2*p,7*p,7*p+q);
    pastePixels(data2,dst,9*q+4,11*q+4,3*q,4*q,p,2*p,7*p+q,8*p);

    return dst;
}


function merge_skin(data,data2,dst){
    if(parts2[0].getAttribute("checked")=="true")copy_pixels(data2,dst,0,16,0,32);
    if(parts2[1].getAttribute("checked")=="true")copy_pixels(data2,dst,16,32,16,40);
    if(parts2[2].getAttribute("checked")=="true")copy_pixels(data2,dst,16,32,40,56);
    if(parts2[3].getAttribute("checked")=="true")copy_pixels(data2,dst,16,32,0,16);
    if(parts2[4].getAttribute("checked")=="true")copy_pixels(data2,dst,48,64,32,48);
    if(parts2[5].getAttribute("checked")=="true")copy_pixels(data2,dst,48,64,16,32);

    if(parts2[6].getAttribute("checked")=="true")copy_pixels(data2,dst,0,16,32,64);
    if(parts2[7].getAttribute("checked")=="true")copy_pixels(data2,dst,32,48,16,40);
    if(parts2[8].getAttribute("checked")=="true")copy_pixels(data2,dst,32,48,40,56);
    if(parts2[9].getAttribute("checked")=="true")copy_pixels(data2,dst,32,48,0,16);
    if(parts2[10].getAttribute("checked")=="true")copy_pixels(data2,dst,48,64,48,64);
    if(parts2[11].getAttribute("checked")=="true")copy_pixels(data2,dst,48,64,0,16);

    if(parts1[0].getAttribute("checked")=="true")copy_pixels(data,dst,0,16,0,32);
    if(parts1[1].getAttribute("checked")=="true")copy_pixels(data,dst,16,32,16,40);
    if(parts1[2].getAttribute("checked")=="true")copy_pixels(data,dst,16,32,40,56);
    if(parts1[3].getAttribute("checked")=="true")copy_pixels(data,dst,16,32,0,16);
    if(parts1[4].getAttribute("checked")=="true")copy_pixels(data,dst,48,64,32,48);
    if(parts1[5].getAttribute("checked")=="true")copy_pixels(data,dst,48,64,16,32);

    if(parts1[6].getAttribute("checked")=="true")copy_pixels(data,dst,0,16,32,64);
    if(parts1[7].getAttribute("checked")=="true")copy_pixels(data,dst,32,48,16,40);
    if(parts1[8].getAttribute("checked")=="true")copy_pixels(data,dst,32,48,40,56);
    if(parts1[9].getAttribute("checked")=="true")copy_pixels(data,dst,32,48,0,16);
    if(parts1[10].getAttribute("checked")=="true")copy_pixels(data,dst,48,64,48,64);
    if(parts1[11].getAttribute("checked")=="true")copy_pixels(data,dst,48,64,0,16);
    return dst;

}
//2.での画像処理関数(一般)
async function replaceImage(func){
    const Container=document.querySelector("#container0");
    const imageContainer=Container.querySelector("#image-container");
    const li_list= imageContainer.querySelectorAll("li");
    let count=0;
    for (li of li_list){
        if(li.classList.contains("checked")){
            count++;
            const img=li.querySelector(".img");
            const img2=li.querySelector(".img2");
            await process(img2.src,func).then((url1) => {
                if (url1 != null) {
                    img2.src=url1;
                }
            });
            await Generalprocess(img2.src,16,32,genFrontImage).then((url2) => {
                if (url2 != null) {
                    img.src=url2;
                }
            });
        }
    }
    if(count==0)alert("スキンを先に選択してください。")
}
async function replaceImages(func){
    const Container=document.querySelector("#container0");
    const imageContainer=Container.querySelector("#image-container");
    const li_list= imageContainer.querySelectorAll("li");

    const Container1=document.querySelector("#container1");
    const imageContainer1=Container1.querySelector("#image-container");
    const li_list1= imageContainer1.querySelectorAll("li");

    const Container2=document.querySelector("#container2");
    const imageContainer2=Container2.querySelector("#image-container");
    let count=0;
    let count1=0;
    for (li of li_list){
        if(li.classList.contains("checked")){
            count++;
            const img2=li.querySelector(".img2");
            for(li1 of li_list1){
                if(li1.classList.contains("checked")){
                    count1++;
                    const img4=li1.querySelector(".img2");

                    const copiedElement = li.cloneNode(true);
                    const newimg=copiedElement.querySelector(".img");
                    const newimg2=copiedElement.querySelector(".img2");

                    await replace_process(img2.src,img4.src,func).then((url1) => {
                        if (url1 != null) {
                            newimg2.src=url1;
                        }
                    });
                    await Generalprocess(newimg2.src,16,32,genFrontImage).then((url2) => {
                        if (url2 != null) {
                            newimg.src=url2;
                        }
                    });
                    imageContainer2.appendChild(copiedElement);
                }
            }
            
        }
    }
    updatecount(uls[2]);
    if(count==0&&count1==0)alert("スキンを先に選択してください。")
}
function moveLi(id,id2){
    li_list=uls[id].querySelectorAll("li");
    const ul=uls[id2];
    let count=0;
    for (li of li_list){
        if(li.classList.contains("checked")){
            ul.appendChild(li.cloneNode(true));
            li.remove();
            count++;
        }
    }
    if(count==0)alert("スキンを先に選択して下さい。");
    updatecount(uls[id]);
    updatecount(uls[id2]);
}