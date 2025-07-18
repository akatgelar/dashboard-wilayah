'use client';

import { MapContainer, GeoJSON, TileLayer, Tooltip, Popup } from "react-leaflet"
// import { Marker, Popup } from "react-leaflet"
import L from 'leaflet';
import { Feature, FeatureCollection, GeoJsonProperties } from 'geojson';
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import { useEffect, useRef, useState } from "react"
import React from 'react'
import Select, { SingleValue, SelectInstance } from 'react-select'    
     

// Fix Leaflet's default icon paths
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});


type KelurahanModel = {
  provinsi_kode: string;
  provinsi_nama: string; 
  kota_kode: string;
  kota_nama: string; 
  kecamatan_kode: string;
  kecamatan_nama: string; 
  kelurahan_kode: string;
  kelurahan_nama: string; 
}

type KecamatanModel = {
  provinsi_kode: string;
  provinsi_nama: string; 
  kota_kode: string;
  kota_nama: string; 
  kecamatan_kode: string;
  kecamatan_nama: string;  
}

type KotaModel = {
  provinsi_kode: string;
  provinsi_nama: string; 
  kota_kode: string;
  kota_nama: string;  
}

type ProvinsiModel = {
  provinsi_kode: string;
  provinsi_nama: string;  
}

type KamusModel = {
  kode: string;
  nama: string;  
}

type PercentileModel = {
  wilayah_kode: string;
  wilayah_nama: string;
  value: number;
  color: string;
}

type RangelistModel = {
  from: number;
  to: number;
  color: string;
  total_cluster: number;
}

type OptionsModel = {
  value: string;
  label: string;
}

export default  function MapComponent() {
  
  const initializedOverview = useRef(false)

  const [mapCenter, setMapCenter] = useState<[number, number]>([-1.9327422372002818, 118.44064309533289]) 
  const [mapZoom, setMapZoom] = useState<number>(5)
  
  const selectedTab = useRef<"provinsi" | "kota" | "kecamatan" | "kelurahan">("provinsi")  
  const getButtonClass = (option: "provinsi" | "kota" | "kecamatan" | "kelurahan") =>
    selectedTab.current === option
      ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
      : "text-gray-500 dark:text-gray-400";
  
  // list option
  const [optionsProvinsi, setOptionsProvinsi] = useState<OptionsModel[]>()
  const [optionsKota, setOptionsKota] = useState<OptionsModel[]>()
  const [optionsKecamatan, setOptionsKecamatan] = useState<OptionsModel[]>()
  const [optionsKelurahan, setOptionsKelurahan] = useState<OptionsModel[]>()
  const [optionsKamus, setOptionsKamus] = useState<OptionsModel[]>()

  // value variable
  const selectedProvinsi = useRef<OptionsModel>({label:'', value:''})
  const selectedKota = useRef<OptionsModel>({label:'', value:''})
  const selectedKecamatan = useRef<OptionsModel>({label:'', value:''})
  const selectedKelurahan = useRef<OptionsModel>({label:'', value:''}) 
  const selectedKamus= useRef<OptionsModel>({label:'', value:''}) 

  // referensi selected
  const selectInputProvinsi = useRef<SelectInstance<OptionsModel>>(null);
  const selectInputKota = useRef<SelectInstance<OptionsModel>>(null);
  const selectInputKecamatan = useRef<SelectInstance<OptionsModel>>(null);
  const selectInputKelurahan = useRef<SelectInstance<OptionsModel>>(null);
  const selectInputKamus = useRef<SelectInstance<OptionsModel>>(null);

  const geoJsonTemp: FeatureCollection= {
    type: "FeatureCollection",
    features: [] as Feature[]
  };

  const [geoJsonKey, setGeoJsonKey] = useState(0);
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection>(geoJsonTemp)

  const [percentileData, setPercentileData] = useState<PercentileModel[]>()
  const [rangelistData, setRangelistData] = useState<RangelistModel[]>()
  
  useEffect(() => { 
    if (!initializedOverview.current) {
      initializedOverview.current = true 
      fetchKamus()
      fetchAreaProvinsi() 
      setTimeout(function() {
        fetchGeoJson() 
      }, 0); 
    }  
  });

	async function fetchAreaProvinsi() {   
    await fetch('/api/area/provinsi').then((response) => { 
      if (response.status >= 500 && response.status < 600) {
        console.log(response.statusText)
      }  
      return response;
    }).then(async (response) => {
      const result = await response.json()  
      if (result["status"] == true){   
        const tempArray: OptionsModel[] = [];
        result['data'].forEach((element: ProvinsiModel) => {
          const temp: OptionsModel = {
            'value' : element.provinsi_kode,
            'label' : element.provinsi_nama,
          }
          tempArray.push(temp);
        });    
        setOptionsProvinsi(tempArray) 
      } else { 
        console.log(result['message'])
      } 
    }).catch((error) => { 
      console.log(error); 
    }); 
  }

	async function fetchAreaKota(row: SingleValue<OptionsModel>) {    
    await fetch('/api/area/kota?provinsi_kode='+row?.value).then((response) => { 
      if (response.status >= 500 && response.status < 600) {
        console.log(response.statusText)
      }  
      return response;
    }).then(async (response) => {
      const result = await response.json()  
      if (result["status"] == true){     
        const tempArray: OptionsModel[] = [];
        result['data'].forEach((element: KotaModel) => {
          const temp: OptionsModel = {
            'value' : element.kota_kode,
            'label' : element.kota_nama,
          }
          tempArray.push(temp);
        });    
        setOptionsKota(tempArray) 
      } else { 
        console.log(result['message'])
      } 
    }).catch((error) => { 
      console.log(error); 
    }); 
  }

	async function fetchAreaKecamatan(row: SingleValue<OptionsModel>) {   
    await fetch('/api/area/kecamatan?kota_kode='+row?.value).then((response) => { 
      if (response.status >= 500 && response.status < 600) {
        console.log(response.statusText)
      }  
      return response;
    }).then(async (response) => {
      const result = await response.json()  
      if (result["status"] == true){     
        const tempArray: OptionsModel[] = [];
        result['data'].forEach((element: KecamatanModel) => {
          const temp: OptionsModel = {
            'value' : element.kecamatan_kode,
            'label' : element.kecamatan_nama,
          }
          tempArray.push(temp);
        });    
        setOptionsKecamatan(tempArray) 
      } else { 
        console.log(result['message'])
      } 
    }).catch((error) => { 
      console.log(error); 
    }); 
  }

	async function fetchAreaKelurahan(row: SingleValue<OptionsModel>) {   
    await fetch('/api/area/kelurahan?kecamatan_kode='+row?.value).then((response) => { 
      if (response.status >= 500 && response.status < 600) {
        console.log(response.statusText)
      }  
      return response;
    }).then(async (response) => {
      const result = await response.json()  
      if (result["status"] == true){     
        const tempArray: OptionsModel[] = [];
        result['data'].forEach((element: KelurahanModel) => {
          const temp: OptionsModel = {
            'value' : element.kelurahan_kode,
            'label' : element.kelurahan_nama,
          }
          tempArray.push(temp);
        });    
        setOptionsKelurahan(tempArray) 
      } else { 
        console.log(result['message'])
      } 
    }).catch((error) => { 
      console.log(error); 
    }); 
  }

	async function fetchKamus() {   
    await fetch('/api/podes/kamus').then((response) => { 
      if (response.status >= 500 && response.status < 600) {
        console.log(response.statusText)
      }  
      return response;
    }).then(async (response) => {
      const result = await response.json()  
      if (result["status"] == true){   
        const tempArray: OptionsModel[] = [];
        result['data'].forEach((element: KamusModel) => {
          const temp: OptionsModel = {
            'value' : element.kode,
            'label' : element.nama,
          }
          tempArray.push(temp);
        });    
        setOptionsKamus(tempArray) 
      } else { 
        console.log(result['message'])
      } 
    }).catch((error) => { 
      console.log(error); 
    }); 
  }


  const onChangeProvinsi = (newValue: SingleValue<OptionsModel>) => {  
    if (newValue) {
      // value
      selectedProvinsi.current = {label: newValue!.label, value: newValue!.value};
      selectedKota.current = {label: '', value: ''}
      selectedKecamatan.current = {label: '', value: ''}
      selectedKelurahan.current = {label: '', value: ''} 
      // ref 
      selectInputKota.current?.clearValue()
      selectInputKecamatan.current?.clearValue()
      selectInputKelurahan.current?.clearValue()
      // call
      fetchAreaKota(newValue) 
      fetchGeoJson()
    } 
  };

  const onChangeKota =  (newValue: SingleValue<OptionsModel>) => {  
    if (newValue) {
      // value
      selectedKota.current = {label: newValue!.label, value: newValue!.value};
      selectedKecamatan.current = {label: '', value: ''}
      selectedKelurahan.current = {label: '', value: ''} 
      // ref 
      selectInputKecamatan.current?.clearValue()
      selectInputKelurahan.current?.clearValue()
      // call
      fetchAreaKecamatan(newValue)
      fetchGeoJson()
    }  
  };

  const onChangeKecamatan = (newValue: SingleValue<OptionsModel>) => {  
    if (newValue) {
      // value
      selectedKecamatan.current = {label: newValue!.label, value: newValue!.value};
      selectedKelurahan.current = {label: '', value: ''} 
      // ref 
      selectInputKelurahan.current?.clearValue()
      // call
      fetchAreaKelurahan(newValue)
      fetchGeoJson()
    }
  };

  const onChangeKelurahan =  (newValue: SingleValue<OptionsModel>) => {  
    if (newValue) {
      // value
      selectedKelurahan.current = {label: newValue!.label, value: newValue!.value}; 
      // call
      fetchGeoJson()
    }
  };

  const onChangeKamus =  (newValue: SingleValue<OptionsModel>) => {  
    if (newValue) {
      // value
      selectedKamus.current = {label: newValue!.label, value: newValue!.value}; 
      // call
      fetchPercentile()
    }
  };

  function clearProvinsi() {  
    // value
    selectedProvinsi.current = {label: '', value: ''};
    selectedKota.current = {label: '', value: ''}
    selectedKecamatan.current = {label: '', value: ''}
    selectedKelurahan.current = {label: '', value: ''}  
    // ref
    selectInputProvinsi.current?.clearValue(); 
    selectInputKota.current?.clearValue(); 
    selectInputKecamatan.current?.clearValue(); 
    selectInputKelurahan.current?.clearValue(); 
    // list
    const tempArray: OptionsModel[] = [];
    setOptionsKota(tempArray)
    setOptionsKecamatan(tempArray)
    setOptionsKelurahan(tempArray)
    fetchGeoJson()
  } 

  function clearKota() {  
    // value
    selectedKota.current = {label: '', value: ''} 
    selectedKecamatan.current = {label: '', value: ''}
    selectedKelurahan.current = {label: '', value: ''} 
    // ref
    selectInputKota.current?.clearValue(); 
    selectInputKecamatan.current?.clearValue(); 
    selectInputKelurahan.current?.clearValue(); 
    // list
    const tempArray: OptionsModel[] = []; 
    setOptionsKecamatan(tempArray)
    setOptionsKelurahan(tempArray)
    fetchGeoJson()
  }

  function clearKecamatan() {  
    // value
    selectedKecamatan.current = {label: '', value: ''}
    selectedKelurahan.current = {label: '', value: ''} 
    // ref
    selectInputKecamatan.current?.clearValue(); 
    selectInputKelurahan.current?.clearValue(); 
    // list
    const tempArray: OptionsModel[] = [];  
    setOptionsKelurahan(tempArray)
    fetchGeoJson()
  }

  function clearKelurahan() {  
    // value
    selectedKelurahan.current = {label: '', value: ''}  
    // ref
    selectInputKelurahan.current?.clearValue(); 
    // list
    fetchGeoJson()
  }

  function clearKamus() {  
    // value
    selectedKamus.current = {label: '', value: ''} 
    // ref 
    selectInputKamus.current?.clearValue();   
    // list
    fetchGeoJson()
  }
  
  
	async function fetchGeoJson() {

    if (selectedKamus.current?.value) {
      fetchPercentile()
    }

    const url = selectedTab.current 
    let param = '';  

    setMapZoom(5)
    if (selectedProvinsi.current?.value) { 
      param = '?provinsi_kode='+selectedProvinsi.current?.value
      setMapZoom(7)
    } 
    if (selectedKota.current?.value) { 
      param = '?kota_kode='+selectedKota.current?.value
      setMapZoom(10)
    } 
    if (selectedKecamatan.current?.value) { 
      param = '?kecamatan_kode='+selectedKecamatan.current?.value
      setMapZoom(13)
    } 
    if (selectedKelurahan.current?.value) { 
      param = '?kelurahan_kode='+selectedKelurahan.current?.value
      setMapZoom(16)
    } 
  
    await fetch('/api/polygon/' + url + param).then((response) => { 
      if (response.status >= 500 && response.status < 600) {
        console.log(response.statusText)
      }  
      return response;
    }).then(async (response) => {
      const result = await response.json()  
      if (result["status"] == true) {
        geoJsonTemp['features'] = []
        result['data'].forEach((element: Feature) => {
          geoJsonTemp['features'].push(element);
        }); 
        setGeoJsonData(geoJsonTemp) 
        setGeoJsonKey(prev => prev + 1); 
 
        const geoJsonLayer = L.geoJSON(geoJsonTemp);
        const bounds = geoJsonLayer.getBounds();
        const centerLatLng = bounds.getCenter(); 
        setMapCenter([centerLatLng.lat, centerLatLng.lng]);

        
  
      } else { 
        console.log(result['message'])
      } 
    }).catch((error) => { 
      console.log(error); 
    }); 
  }

  async function fetchPercentile() {

    const url = '/api/podes/percentile'
    let param = '?podes_kode='+selectedKamus.current.value
    if (selectedProvinsi.current.value !== '') {
      param += '&provinsi_kode='+selectedProvinsi.current.value
      setMapZoom(7)
    } 
    if (selectedKota.current.value !== '') {
      param += '&kota_kode='+selectedKota.current.value
      setMapZoom(10)
    } 
    if (selectedKecamatan.current.value !== '') {
      param += '&kecamatan_kode='+selectedKecamatan.current.value
      setMapZoom(13)
    } 
    if (selectedKelurahan.current.value !== '') {
      param += '&kelurahan_kode='+selectedKelurahan.current.value
      setMapZoom(16)
    } 

    await fetch(url+param).then((response) => { 
      if (response.status >= 500 && response.status < 600) {
        console.log(response.statusText)
      }  
      return response;
    }).then(async (response) => {
      const result = await response.json()  
      if (result["status"] == true) {  
        setPercentileData(result['data']['result'])
        setRangelistData(result['data']['rangelist']) 
      } else { 
        console.log(result['message'])
      } 
    }).catch((error) => { 
      console.log(error); 
    }); 
  }
 
  function generatePopup(selectedTab: string, properties: GeoJsonProperties, value: number) { 
    let html =  
      `<table>
        <tbody>`;
    if ((['provinsi', 'kota', 'kecamatan', 'kelurahan'].includes(selectedTab)) ) {
      html +=
            `<tr>
              <td>Provinsi </td>
              <td>&nbsp; : &nbsp;</td>
              <td>(${properties?.provinsi_kode}) ${properties?.provinsi_nama}</td>
            </tr>`;
    }
    if ((['kota', 'kecamatan', 'kelurahan'].includes(selectedTab)) ) {
      html +=
            `<tr>
              <td>Kota </td>
              <td>&nbsp; : &nbsp;</td>
              <td>(${properties?.kota_kode}) ${properties?.kota_nama}</td>
            </tr>`;
    }
    if ((['kecamatan', 'kelurahan'].includes(selectedTab)) ) {
      html +=
            `<tr>
              <td>Kecamatan </td>
              <td>&nbsp; : &nbsp;</td>
              <td>(${properties?.kecamatan_kode}) ${properties?.kecamatan_nama}</td>
            </tr>`;
    }
    if ((['kelurahan'].includes(selectedTab)) ) {
      html += 
            `<tr>
              <td>Kelurahan </td>
              <td>&nbsp; : &nbsp;</td>
              <td>(${properties?.kelurahan_kode}) ${properties?.kelurahan_nama}</td>
            </tr>`;
    }
    html +=
          `<tr>
            <td>Value </td>
            <td>&nbsp; : &nbsp;</td>
            <td>${value.toLocaleString('id')}</td>
          </tr>`;
    html +=
        `</tbody>
      </table>
      `
      return html;
  }
 
  function percentileLookup(kode: string) { 
    let result: PercentileModel = {
      color: 'transparent',
      wilayah_kode: '00',
      wilayah_nama: '-',
      value: 0
    };
    percentileData?.forEach(element => {
      if(element.wilayah_kode == kode) {
        result = element
      }  
    }); 
    return result; 
  }


  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ">
      
      {/* title */}
      {/* <div className="px-6 py-5 flex flex-col gap-5 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Map Insight
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Lihat insight berdasarkan wilayah
          </p>
        </div> 
      </div> */}

      {/* content */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6"> 
        
        <div className="grid grid-cols-12 gap-4 mb-2">
          {/* tab */} 
          <div className="col-span-6">  
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Pilih jenis wilayah </label>
            <div className="inline-flex gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900 mb-2">
              <button
                onClick={() => {
                  selectedTab.current = "provinsi"  
                  setTimeout(function() {
                    fetchGeoJson()
                  }, 0);
                }}
                className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900   dark:hover:text-white ${getButtonClass("provinsi")}`}
              >
                Provinsi 
              </button>

              <button
                onClick={() => {
                  selectedTab.current = "kota" 
                  setTimeout(function() {
                    fetchGeoJson()
                  }, 0);
                }}
                className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900   dark:hover:text-white ${getButtonClass("kota")}`}
              >
                Kabupaten/Kota
              </button>

              <button
                onClick={() => { 
                  selectedTab.current = "kecamatan"
                  setTimeout(function() {
                    fetchGeoJson()
                  }, 0);
                }}
                className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900   dark:hover:text-white ${getButtonClass("kecamatan")}`}
              >
                Kecamatan 
              </button>

              <button
                onClick={() => {
                  selectedTab.current = "kelurahan"
                  setTimeout(function() {
                    fetchGeoJson()
                  }, 0);
                }}
                className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900   dark:hover:text-white ${getButtonClass("kelurahan")}`}
              >
                Desa/Kelurahan
              </button>
            </div>
          </div>
 
          {/* dropdown kamus */}   
          <div className="col-span-6 ml-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Variable Data</label>
            <div className="flex justify ">
              <Select ref={selectInputKamus} options={optionsKamus} onChange={onChangeKamus} className="w-full"/> 
              <button onClick={clearKamus}>
                <svg className="ml-1" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.78362 8.78412C8.49073 9.07702 8.49073 9.55189 8.78362 9.84478L10.9388 12L8.78362 14.1552C8.49073 14.4481 8.49073 14.923 8.78362 15.2159C9.07652 15.5088 9.55139 15.5088 9.84428 15.2159L11.9995 13.0607L14.1546 15.2158C14.4475 15.5087 14.9224 15.5087 15.2153 15.2158C15.5082 14.9229 15.5082 14.448 15.2153 14.1551L13.0602 12L15.2153 9.84485C15.5082 9.55196 15.5082 9.07708 15.2153 8.78419C14.9224 8.4913 14.4475 8.4913 14.1546 8.78419L11.9995 10.9393L9.84428 8.78412C9.55139 8.49123 9.07652 8.49123 8.78362 8.78412Z" fill="gray"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM3.5 12C3.5 7.30558 7.30558 3.5 12 3.5C16.6944 3.5 20.5 7.30558 20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C7.30558 20.5 3.5 16.6944 3.5 12Z" fill="gray"/>
                </svg>
              </button>
            </div>
          </div>  

        </div>

        {/* dropdown wilayah */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          {
            (['provinsi', 'kota', 'kecamatan', 'kelurahan'].includes(selectedTab.current)) 
            ?
              <div className="col-span-3">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Provinsi</label>
                <div className="flex justify ">
                  <Select ref={selectInputProvinsi} options={optionsProvinsi} onChange={onChangeProvinsi} className="w-full"/> 
                  <button onClick={clearProvinsi}>
                    <svg className="ml-1" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.78362 8.78412C8.49073 9.07702 8.49073 9.55189 8.78362 9.84478L10.9388 12L8.78362 14.1552C8.49073 14.4481 8.49073 14.923 8.78362 15.2159C9.07652 15.5088 9.55139 15.5088 9.84428 15.2159L11.9995 13.0607L14.1546 15.2158C14.4475 15.5087 14.9224 15.5087 15.2153 15.2158C15.5082 14.9229 15.5082 14.448 15.2153 14.1551L13.0602 12L15.2153 9.84485C15.5082 9.55196 15.5082 9.07708 15.2153 8.78419C14.9224 8.4913 14.4475 8.4913 14.1546 8.78419L11.9995 10.9393L9.84428 8.78412C9.55139 8.49123 9.07652 8.49123 8.78362 8.78412Z" fill="gray"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM3.5 12C3.5 7.30558 7.30558 3.5 12 3.5C16.6944 3.5 20.5 7.30558 20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C7.30558 20.5 3.5 16.6944 3.5 12Z" fill="gray"/>
                    </svg>
                  </button>
                </div>
              </div>
            : <></>
          }
          {
            (['kota', 'kecamatan', 'kelurahan'].includes(selectedTab.current)) 
            ? 
              <div className="col-span-3">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Kabupaten / Kota</label>
                <div className="flex justify ">
                  <Select ref={selectInputKota} options={optionsKota} onChange={onChangeKota} className="w-full"/> 
                  <button onClick={clearKota}>
                    <svg className="ml-1" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.78362 8.78412C8.49073 9.07702 8.49073 9.55189 8.78362 9.84478L10.9388 12L8.78362 14.1552C8.49073 14.4481 8.49073 14.923 8.78362 15.2159C9.07652 15.5088 9.55139 15.5088 9.84428 15.2159L11.9995 13.0607L14.1546 15.2158C14.4475 15.5087 14.9224 15.5087 15.2153 15.2158C15.5082 14.9229 15.5082 14.448 15.2153 14.1551L13.0602 12L15.2153 9.84485C15.5082 9.55196 15.5082 9.07708 15.2153 8.78419C14.9224 8.4913 14.4475 8.4913 14.1546 8.78419L11.9995 10.9393L9.84428 8.78412C9.55139 8.49123 9.07652 8.49123 8.78362 8.78412Z" fill="gray"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM3.5 12C3.5 7.30558 7.30558 3.5 12 3.5C16.6944 3.5 20.5 7.30558 20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C7.30558 20.5 3.5 16.6944 3.5 12Z" fill="gray"/>
                    </svg>
                  </button>
                </div>
              </div>
            : <></>
          } 
          {
            (['kecamatan', 'kelurahan'].includes(selectedTab.current)) 
            ?
              <div className="col-span-3">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Kecamatan</label>
                <div className="flex justify ">
                  <Select ref={selectInputKecamatan} options={optionsKecamatan} onChange={onChangeKecamatan} className="w-full"/> 
                  <button onClick={clearKecamatan}>
                    <svg className="ml-1" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.78362 8.78412C8.49073 9.07702 8.49073 9.55189 8.78362 9.84478L10.9388 12L8.78362 14.1552C8.49073 14.4481 8.49073 14.923 8.78362 15.2159C9.07652 15.5088 9.55139 15.5088 9.84428 15.2159L11.9995 13.0607L14.1546 15.2158C14.4475 15.5087 14.9224 15.5087 15.2153 15.2158C15.5082 14.9229 15.5082 14.448 15.2153 14.1551L13.0602 12L15.2153 9.84485C15.5082 9.55196 15.5082 9.07708 15.2153 8.78419C14.9224 8.4913 14.4475 8.4913 14.1546 8.78419L11.9995 10.9393L9.84428 8.78412C9.55139 8.49123 9.07652 8.49123 8.78362 8.78412Z" fill="gray"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM3.5 12C3.5 7.30558 7.30558 3.5 12 3.5C16.6944 3.5 20.5 7.30558 20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C7.30558 20.5 3.5 16.6944 3.5 12Z" fill="gray"/>
                    </svg>
                  </button>
                </div>
              </div>
            : <></>
          } 
          {
            (['kelurahan'].includes(selectedTab.current)) 
            ?
              <div className="col-span-3">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Desa / Kelurahan</label>
                <div className="flex justify ">
                  <Select ref={selectInputKelurahan} options={optionsKelurahan} onChange={onChangeKelurahan} className="w-full"/> 
                  <button onClick={clearKelurahan}>
                    <svg className="ml-1" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.78362 8.78412C8.49073 9.07702 8.49073 9.55189 8.78362 9.84478L10.9388 12L8.78362 14.1552C8.49073 14.4481 8.49073 14.923 8.78362 15.2159C9.07652 15.5088 9.55139 15.5088 9.84428 15.2159L11.9995 13.0607L14.1546 15.2158C14.4475 15.5087 14.9224 15.5087 15.2153 15.2158C15.5082 14.9229 15.5082 14.448 15.2153 14.1551L13.0602 12L15.2153 9.84485C15.5082 9.55196 15.5082 9.07708 15.2153 8.78419C14.9224 8.4913 14.4475 8.4913 14.1546 8.78419L11.9995 10.9393L9.84428 8.78412C9.55139 8.49123 9.07652 8.49123 8.78362 8.78412Z" fill="gray"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM3.5 12C3.5 7.30558 7.30558 3.5 12 3.5C16.6944 3.5 20.5 7.30558 20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C7.30558 20.5 3.5 16.6944 3.5 12Z" fill="gray"/>
                    </svg>
                  </button>
                </div>
              </div>
            : <></>
          } 
        </div> 
 

        {/* map */}
        {/* <span>{geoJsonData.features.length}</span> */}
        <div className="min-w-[1000px] xl:min-w-full">
          <MapContainer 
            key={geoJsonKey} 
            center={mapCenter} 
            zoom={mapZoom} 
            scrollWheelZoom={true} 
            style={{ height: "450px", width: "100%", zIndex: 0 }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />    
            
            {
              geoJsonData.features?.map((polygon, indexPolygon) => {
                const kode = polygon.properties?.[`${selectedTab.current}_kode`];
                const nama = polygon.properties?.[`${selectedTab.current}_nama`];
                const percentile = percentileLookup(kode);
                const fillColor = percentile?.color || (percentileData ? 'lightgray' : 'transparent');
                const value = percentile?.value || 0;  

                return (
                  <GeoJSON
                    key={`geojson${geoJsonKey}-polygon${indexPolygon}`}
                    data={polygon}
                    style={{ fillColor, fillOpacity: 1, color: 'black', opacity: 1, weight: 0.5}}
                  >
                    <Popup key={`geojson${geoJsonKey}-popup${indexPolygon}`}>
                      <div dangerouslySetInnerHTML={{ __html: generatePopup(selectedTab.current, polygon.properties, value) }}></div>  
                    </Popup>
                    {/* <Popup>{value}</Popup>  */}
                    <Tooltip>{nama}</Tooltip> 
                  </GeoJSON>
                );
              })
            } 
          </MapContainer> 
          <div key="range" className="flex mt-2 justify-center">
            {
              rangelistData?.map((item, index) => (     
                  <span key={'range-'+index} className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                    <span className="flex w-4 h-4 me-3 shrink-0" style={{backgroundColor: item.color, border: 'black 1px solid'}}></span>
                    {item.from.toLocaleString('id')} - {item.to.toLocaleString('id')}
                  </span> 
              ))
            }
          </div>
        </div>
        
      </div>
    </div> 
  );
}