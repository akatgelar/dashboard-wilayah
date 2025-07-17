import { NextRequest } from 'next/server'
import fs from 'fs';
import path from 'path';
 
type FeatureModel = {
  type: string;
  geometry: GeometryModel;
  properties: PropertiesModel;
};
type GeometryModel = {
  type: string;
  coordinates: unknown; 
};

type PropertiesModel = {
  provinsi_kode: string;
  provinsi_nama: string; 
  kota_kode: string;
  kota_nama: string; 
  kecamatan_kode: string;
  kecamatan_nama: string; 
  kelurahan_kode: string;
  kelurahan_nama: string; 
};

export async function GET(request: NextRequest) {  
  
  try {  
    const {searchParams} = new URL(request.url);  
    const provinsi_kode = searchParams.get("provinsi_kode");
    const kota_kode = searchParams.get("kota_kode");
    const kecamatan_kode = searchParams.get("kecamatan_kode");
    const kelurahan_kode = searchParams.get("kelurahan_kode"); 

    const filePath = path.join(process.cwd(), 'public', 'data', 'kelurahan_small.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents); 

    const result: FeatureModel[] = [];
    data['features'].forEach((row: FeatureModel) => { 
      if (provinsi_kode != null) {
        if (row.properties.provinsi_kode === provinsi_kode) {
          if (row.geometry) { 
            result.push(row);
          }
        }
      }
      else if (kota_kode != null) {
        if (row.properties.kota_kode === kota_kode) {
          if (row.geometry) { 
            result.push(row);
          }
        }
      }
      else if (kecamatan_kode != null) {
        if (row.properties.kecamatan_kode === kecamatan_kode) {
          if (row.geometry) { 
            result.push(row);
          }
        }
      }
      else if (kelurahan_kode != null) {
        if (row.properties.kelurahan_kode === kelurahan_kode) {
          if (row.geometry) { 
            result.push(row);
          }
        }
      }
      else {
        if (row.geometry) { 
          result.push(row);
        }
      } 
    });

    const response = {
      'status': true,
      'message': 'Get Data Success',
      'data': result
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