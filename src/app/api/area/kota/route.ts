import { NextRequest } from 'next/server'
import fs from 'fs';
import path from 'path';
   
type AreaModel = {
  provinsi_kode: string;
  provinsi_nama: string; 
  kota_kode: string;
  kota_nama: string; 
  kecamatan_kode: string;
  kecamatan_nama: string; 
  kelurahan_kode: string;
  kelurahan_nama: string; 
};

type KotaModel = {
  provinsi_kode: string;
  provinsi_nama: string; 
  kota_kode: string;
  kota_nama: string; 
}

export async function GET(request: NextRequest) {  
  
  try {   
    const {searchParams} = new URL(request.url);   
    const params_provinsi_kode = searchParams.get("provinsi_kode");
    const params_kota_kode = searchParams.get("kota_kode");

    const filePath = path.join(process.cwd(), 'public', 'data', 'area.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents); 

    let filteredData: AreaModel[] = data;
    if (params_provinsi_kode != null) {
      filteredData = data.filter((item:AreaModel) => item.provinsi_kode === params_provinsi_kode);
    }  
    if (params_kota_kode != null) {
      filteredData = data.filter((item:AreaModel) => item.kota_kode === params_kota_kode);
    }  

    const uniqueData: KotaModel[] = [
      ...new Map<string, KotaModel>(
        filteredData.map((item: AreaModel) => [
          item.kota_kode, 
          { 
            provinsi_kode: item.provinsi_kode.toString(), 
            provinsi_nama: item.provinsi_nama,
            kota_kode: item.kota_kode.toString(), 
            kota_nama: item.kota_nama 
          }
        ])
      ).values()
    ].sort((a,b) => a.kota_nama.localeCompare(b.kota_nama));

    const response = {
      'status': true,
      'message': 'Get Data Success', 
      'data': uniqueData
    }

    return Response.json(response)

   } catch(error){
    if (typeof error === "string") {
      throw new Error(error.toUpperCase());
    } else if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
}