
// pages/api/users.js
import mysql from 'mysql2/promise'; 

export async function GET() {  
    try {   
            const connection = await mysql.createConnection({
                host: process.env.MYSQL_HOST || '127.0.0.1',
                port: parseInt(process.env.MYSQL_PORT || '3306', 3306),
                user: process.env.MYSQL_USER || 'root',
                password: process.env.MYSQL_PASSWORD || '',
                database: process.env.MYSQL_DATABASE || 'podes',
            });

        const [rows] = await connection.execute("SELECT `Nama Variabel` as kode, `Keterangan` as nama FROM podes2018_desa_kamus where `Kategori Isian` = '' and `Nama Variabel` not like 'R1%' ORDER BY `Keterangan` ASC");
        const response = {
            'status': true,
            'message': 'Get Data Success', 
            'data': rows
        }
        return Response.json(response)
    
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
