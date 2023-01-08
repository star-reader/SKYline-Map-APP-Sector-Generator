const fs = require('fs')
const numberReg = new RegExp("[0-9]")

let json = []

function readSectorFile(){
    fs.readFile(__dirname+'/FSS.ese',(err,data)=>{
        if (err) return console.log('=======读取扇区文件错误!')
        getSectors(data.toString())
    })
}

function getSectors(file){
    let lastTemp = ''
    let sectors = file.split('[FREETEXT]')[0].split('[AIRSPACE]')[1].split('SECTORLINE:')
    for (let i in sectors){
        let _name = sectors[i].split('\n')[0].replace('L_','').split('_')[0]
        let name = ''
        let type = ''
        _name.indexOf('AP') != -1 ? type = 'APP' : type = 'CTR'
        name = _name.slice(0,4)
        if (numberReg.test(_name)){
            name += `_${_name.slice(6,8)}_${type}`
        }else{
            name += `_${type}`
        }
        if (name == lastTemp){
            continue
        }
        lastTemp = name
        pushGeoData(sectors[i],name,type)
    }
    writeToJson()
}

function pushGeoData(data,name,type){
    let sector = data.split('\n')
    let latlngs = []
    for (let i in sector){
        if (sector[i].indexOf('COORD:') != -1){
            let original = sector[i].split('COORD:')[1]
            let lat = CoordStandardlize(original.split(':')[0].split('N')[1].split('.'))
            let lng = CoordStandardlize(original.split(':')[1].split('E')[1].split('.'))
            latlngs.push([parseFloat(lng),parseFloat(lat)])
        }
    }
    json.push({name,type,coord:latlngs})
}

function CoordStandardlize(coord){
    if (coord[0].slice(0,1) == '0'){
        coord[0] = coord[0].slice(1,coord[0].length)
    }
    let du = coord[0]*1
    let fen = (coord[1]*1) / 60
    let miao = (coord[2]*1) / 60 /100
    //128.32.1 => 128.53
    return (du + fen + miao).toFixed(3)
}

function writeToJson(){
    fs.writeFile(__dirname+'/coord.json',JSON.stringify(json),(err)=>{
        if (err) return console.log('json文件写入失败')
        console.log('坐标数据生成成功')
    })
}

readSectorFile()