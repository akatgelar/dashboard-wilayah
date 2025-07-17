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

type KecamatanModel = {
  provinsi_kode: string;
  provinsi_nama: string; 
  kota_kode: string;
  kota_nama: string; 
  kecamatan_kode: string;
  kecamatan_nama: string; 
}

export async function GET(request: NextRequest) {  
  
  try {   
    const {searchParams} = new URL(request.url);   
    const params_provinsi_kode = searchParams.get("provinsi_kode");
    const params_kota_kode = searchParams.get("kota_kode");
    const params_kecamatan_kode = searchParams.get("kecamatan_kode");

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
    if (params_kecamatan_kode != null) {
      filteredData = data.filter((item:AreaModel) => item.kecamatan_kode === params_kecamatan_kode);
    }  

    const uniqueData: KecamatanModel[] = [
      ...new Map<string, KecamatanModel>(
        filteredData.map((item: AreaModel) => [
          item.kecamatan_kode, 
          { 
            provinsi_kode: item.provinsi_kode.toString(), 
            provinsi_nama: item.provinsi_nama,
            kota_kode: item.kota_kode.toString(), 
            kota_nama: item.kota_nama,
            kecamatan_kode: item.kecamatan_kode.toString(), 
            kecamatan_nama: item.kecamatan_nama 
          }
        ])
      ).values()
    ].sort((a,b) => a.kecamatan_nama.localeCompare(b.kecamatan_nama));

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