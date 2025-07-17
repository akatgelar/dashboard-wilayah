
// pages/api/users.js
import mysql from 'mysql2/promise'; 
import { NextRequest } from 'next/server'; 
import { RowDataPacket } from 'mysql2';
 
export async function GET(request: NextRequest) {  
  
    try {   
        const {searchParams} = new URL(request.url);   
        const params_podes_kode = searchParams.get("podes_kode"); 

        // message param error
        if (params_podes_kode === null) {  
            const response = {
                'status': false,
                'message': 'Param podes_kode not found', 
                'data': {}
            }
            return Response.json(response)

        } else { 
            const sql = `
                SELECT 
                    R101, R102, R103, R104, 
                    R101N, R102N, R103N, R104N,   
                    ${params_podes_kode} as value
                FROM podes2018_desa_extract    
            `; 
 
            const connection = await mysql.createConnection({
                host: process.env.MYSQL_HOST || '127.0.0.1',
                port: parseInt(process.env.MYSQL_PORT || '3306', 3306),
                user: process.env.MYSQL_USER || 'root',
                password: process.env.MYSQL_PASSWORD || '',
                database: process.env.MYSQL_DATABASE || 'podes',
            });

            const [rows] = await connection.execute<RowDataPacket[]>(sql!); 
             
            const response = {
                'status': true,
                'message': 'Get Data Success', 
                'data': rows
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
 