import json
import requests
    
def provinsi():
    try: 
        response = requests.get('https://sig.bps.go.id/rest-bridging/getwilayah?level=provinsi&parent=0&periode_merge=2024_1.2022')
        template = response.json()
            
        # open
        with open("provinsi_small_bps.json", "w") as f:
            f.write('{"type":"FeatureCollection", "features": [\n')
            
        with open("provinsi_small.json", "r") as file:
            data = json.load(file)
            for feature in data['features']:
                
                for temp in template:
                    if feature['properties']['provinsi_kode'] == temp['kode_dagri']:
                        feature['properties']['bps_provinsi_kode'] = temp['kode_bps']
                        feature['properties']['bps_provinsi_nama'] = temp['nama_bps'] 
                        print(feature['properties'])  
                        
                        # append
                        with open("provinsi_small_bps.json", "a") as f:
                            f.write(str(feature).replace("'", "\""))
                            f.write(',\n')
                        
        # close
        with open("provinsi_small_bps.json", "a") as f:
            f.write(']}')
                    
    except Exception as e:
        print(e) 

def kota():
    try: 
        template = {}
        with open("provinsi_small_bps.json", "r") as file:
            data = json.load(file)
            for feature in data['features']:
                provinsi_kode = feature['properties']['provinsi_kode']
                provinsi_nama = feature['properties']['provinsi_nama']
                bps_provinsi_kode = feature['properties']['bps_provinsi_kode']
                bps_provinsi_nama = feature['properties']['bps_provinsi_nama']
                
                response = requests.get(f'''https://sig.bps.go.id/rest-bridging/getwilayah?level=kabupaten&parent={bps_provinsi_kode}&periode_merge=2024_1.2022''')
                
                template[provinsi_kode] = {}
                template[provinsi_kode]['bps_provinsi_kode'] = bps_provinsi_kode
                template[provinsi_kode]['bps_provinsi_nama'] = bps_provinsi_nama
                template[provinsi_kode]['detail'] = response.json() 
                
                print(provinsi_kode) 
                # print(template[provinsi_kode])
                
        # open
        with open("kota_small_bps.json", "w") as f:
            f.write('{"type":"FeatureCollection", "features": [\n')
            
        with open("kota_small.json", "r") as file:
            data = json.load(file)
            for feature in data['features']:
                print(feature['properties'])
                 
                for temp in template[feature['properties']['provinsi_kode']]['detail']:
                    if feature['properties']['provinsi_kode'] == temp['kode_dagri']:
                        feature['properties']['bps_provinsi_kode'] = template[feature['properties']['provinsi_kode']]['bps_provinsi_kode']
                        feature['properties']['bps_provinsi_nama'] = template[feature['properties']['provinsi_kode']]['bps_provinsi_nama']
                        feature['properties']['bps_kota_kode'] = temp['kode_bps']
                        feature['properties']['bps_kota_nama'] = temp['nama_bps'] 
                        # print(feature['properties'])  
                        
                        # append
                        with open("kota_small_bps.json", "a") as f:
                            f.write(str(feature).replace("'", "\""))
                            f.write(',\n')
                        
        # close
        with open("kota_small_bps.json", "a") as f:
            f.write(']}')
                    
            
    except Exception as e:
        print(e) 
    

if __name__ == "__main__":
    # provinsi()
    kota()