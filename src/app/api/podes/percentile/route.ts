
// pages/api/users.js
import mysql from 'mysql2/promise'; 
import { NextRequest } from 'next/server';
import chroma from 'chroma-js';
import { RowDataPacket } from 'mysql2';

type PercentileDataModel = {
  wilayah_kode: string;
  wilayah_nama: string;
  value: number; 
}

type PercentileRangeListModel = {
  from: number;
  to: number; 
  color: string; 
  total_cluster: number; 
}

export async function GET(request: NextRequest) {  
  
    try {   
        const {searchParams} = new URL(request.url);   
        const params_podes_kode = searchParams.get("podes_kode");
        const params_provinsi_kode = searchParams.get("provinsi_kode");
        const params_kota_kode = searchParams.get("kota_kode");
        const params_kecamatan_kode = searchParams.get("kecamatan_kode");
        const params_kelurahan_kode = searchParams.get("kelurahan_kode");

        // message param error
        if (params_podes_kode === null) {  
            const response = {
                'status': false,
                'message': 'Param podes_kode not found', 
                'data': {}
            }
            return Response.json(response)

        } else { 
            let sql;
            if (params_kelurahan_kode != null) { 
                sql = `
                    SELECT 
                        R101, R102, R103, R104, 
                        R101N, R102N, R103N, R104N, 
                        kemendagri_kelurahan_kode as wilayah_kode,
                        concat(R101N, ' - ', R102N, ' - ', R103N, ' - ', R104N) as wilayah_nama,
                        sum(${params_podes_kode}) as value
                    FROM podes2018_desa_extract 
                    JOIN merge_kelurahan_2021 on bps_kelurahan_kode = concat(R101,R102,R103,R104)
                    WHERE kemendagri_kelurahan_kode = '${params_kelurahan_kode}'
                    GROUP BY R101, R102, R103, R104, R101N, R102N, R103N, R104N, wilayah_kode, wilayah_nama 
                `;
            } else if (params_kecamatan_kode != null) {
                sql = `
                    SELECT 
                        R101, R102, R103, R104, 
                        R101N, R102N, R103N, R104N, 
                        kemendagri_kelurahan_kode as wilayah_kode,
                        concat(R101N, ' - ', R102N, ' - ', R103N, ' - ', R104N) as wilayah_nama,
                        sum(${params_podes_kode}) as value
                    FROM podes2018_desa_extract 
                    JOIN merge_kelurahan_2021 on bps_kelurahan_kode = concat(R101,R102,R103,R104)
                    WHERE kemendagri_kecamatan_kode = '${params_kecamatan_kode}'
                    GROUP BY R101, R102, R103, R104, R101N, R102N, R103N, R104N, wilayah_kode, wilayah_nama 
                `;
            } else if (params_kota_kode != null) {
                sql = `
                    SELECT 
                        R101, R102, R103, 
                        R101N, R102N, R103N, 
                        kemendagri_kecamatan_kode as wilayah_kode,
                        concat(R101N, ' - ', R102N, ' - ', R103N) as wilayah_nama,
                        sum(${params_podes_kode}) as value
                    FROM podes2018_desa_extract 
                    JOIN merge_kecamatan_2021 on bps_kecamatan_kode = concat(R101,R102,R103)
                    WHERE kemendagri_kota_kode = '${params_kota_kode}'
                    GROUP BY R101, R102, R103, R101N, R102N, R103N, wilayah_kode, wilayah_nama
                `;
            } else if (params_provinsi_kode != null) {
                sql = `
                    SELECT 
                        R101, R102, 
                        R101N, R102N, 
                        kemendagri_kota_kode as wilayah_kode,
                        concat(R101N, ' - ', R102N) as wilayah_nama,
                        sum(${params_podes_kode}) as value
                    FROM podes2018_desa_extract 
                    JOIN merge_kota_2021 on bps_kota_kode = concat(R101,R102)
                    WHERE kemendagri_provinsi_kode = '${params_provinsi_kode}'
                    GROUP BY R101, R102, R101N, R102N, wilayah_kode, wilayah_nama
                `;
            }  else {
                sql = `
                    SELECT 
                        R101, 
                        R101N, 
                        kemendagri_provinsi_kode as wilayah_kode,
                        concat(R101N) as wilayah_nama,
                        sum(${params_podes_kode}) as value
                    FROM podes2018_desa_extract 
                    JOIN merge_provinsi_2021 on bps_provinsi_kode = concat(R101) 
                    GROUP BY R101, R101N, wilayah_kode, wilayah_nama
                `;
            }
 
            const connection = await mysql.createConnection({
                host: process.env.MYSQL_HOST || '127.0.0.1',
                port: parseInt(process.env.MYSQL_PORT || '3306', 3306),
                user: process.env.MYSQL_USER || 'root',
                password: process.env.MYSQL_PASSWORD || '',
                database: process.env.MYSQL_DATABASE || 'podes',
            });

            const [rows] = await connection.execute<RowDataPacket[]>(sql!); 
            const data: PercentileDataModel[] = rows as PercentileDataModel[];
                
            const res = createRange(data)
            const result = res[0]
            const rangelist = res[1]
            const response = {
                'status': true,
                'message': 'Get Data Success', 
                'data': {
                    'result': result,
                    'rangelist': rangelist,
                }
            }
            return Response.json(response) 
        }
    
    } catch(error){
        if (typeof error === "string") { 
            const response = {
                'status': false,
                'message': 'Get Data Failed', 
                'data': error.toUpperCase()
            }
            return Response.json(response)
        } else if (error instanceof Error) { 
            const response = {
                'status': false,
                'message': 'Error', 
                'data': error.message
            }
            return Response.json(response)
        }
    }
}

function percentile(arr:number[], p:number) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function checkIfDuplicates(data:number[]) {
    return new Set(data).size !== data.length;
}


function createRange(resData: PercentileDataModel[]) { 
    // Grouping
    const sortedData = [...resData].sort((a, b) => a['wilayah_kode'].localeCompare(b['wilayah_kode'])); 
  
    // Prepare percentile array
    let arrToBePercentile = sortedData.map(row => row['value']).filter(num => num !== 0).sort((a, b) => a - b); 

    // Percentile array
    let count = 4;
    let arrPercentile: number[] = [];

    if (arrToBePercentile.length > 1) {
        while (count >= 1) {
            const diff = 100 / count;
            arrPercentile = [];
            for (let j = 0; j <= count; j++) {
                arrPercentile.push(percentile(arrToBePercentile, j * diff));
            }
            if (checkIfDuplicates(arrPercentile)) {
                count -= 1;
                arrToBePercentile = arrPercentile;
                arrPercentile = [];
            } else {
                break;
            }
        }
    } else if (arrToBePercentile.length === 1) {
        arrPercentile = arrToBePercentile;
    } 

    // Create range color
    const color = ['#e6f7eb', '#10a67e'];
    const rangelist: PercentileRangeListModel[] = [{ from: 0, to: 0, color: '#ffffff', total_cluster: 0 }];

    if (arrPercentile.length > 1) {
        const colors = chroma.scale([color[0], color[1]]).colors(arrPercentile.length - 1);
        for (let i = 0; i < arrPercentile.length - 1; i++) {
            rangelist.push({
                from: Math.ceil(arrPercentile[i]),
                to: Math.ceil(arrPercentile[i + 1]),
                color: colors[i],
                total_cluster: 0
            });
        }
    } else if (arrPercentile.length === 1) {
        const colors = chroma.scale([color[0], color[1]]).colors(1);
        rangelist.push({
            from: Math.ceil(arrPercentile[0]),
            to: Math.ceil(arrPercentile[0]),
            color: colors[0],
            total_cluster: 0
        });
    }

    // Add value and color
    const result = sortedData.map(item => {
        const value = item['value'];
        const range = rangelist.find(r => value >= r.from && value <= r.to);
        if (range) {
            range.total_cluster += 1;
            return { ...item, value, color: range.color };
        }
        return { ...item, value };
    });

    return [result, rangelist]
}
