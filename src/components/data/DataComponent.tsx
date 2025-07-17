'use client'
  
import { useEffect, useMemo, useRef, useState } from "react"
import React from 'react' 
 
import Select, { SingleValue, SelectInstance } from 'react-select'    
import { AllCommunityModule, ColDef, ModuleRegistry } from 'ag-grid-community'; 
import { AgGridReact } from 'ag-grid-react';

ModuleRegistry.registerModules([AllCommunityModule]);
      
type KamusModel = {
  kode: string;
  nama: string;  
}

type OptionsModel = {
  value: string;
  label: string;
}
export default function DataComponent() {
  
  const initializedOverview = useRef(false) 
 
  const [optionsKamus, setOptionsKamus] = useState<OptionsModel[]>()
  const selectedKamus= useRef<OptionsModel>({label:'', value:''}) 
  const selectInputKamus = useRef<SelectInstance<OptionsModel>>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [rowData, setRowData] = useState([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [colDefs, setColDefs] = useState<ColDef[]>([
      { field: "R101N", headerName: "Provinsi", filter: "agTextColumnFilter", sort: "asc" },
      { field: "R102N", headerName: "Kota", filter: "agTextColumnFilter"},
      { field: "R103N", headerName: "Kecamatan", filter: "agTextColumnFilter"},
      { field: "R104N", headerName: "Kelurahan", filter: "agTextColumnFilter"}, 
      { field: "value", filter: "agNumberColumnFilter" },
  ]);

   const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      minWidth: 150,
      filter: true,
      floatingFilter: true,
      suppressHeaderMenuButton: true,
    };
  }, []);

 
  useEffect(() => { 
    if (!initializedOverview.current) {
      initializedOverview.current = true;
      fetchKamus()
    }  
  });
 

	async function fetchData() {   
    setIsLoading(true);
    await fetch('/api/podes/data?podes_kode='+selectedKamus.current.value).then((response) => { 
      if (response.status >= 500 && response.status < 600) {
        console.log(response.statusText)
      }  
      return response;
    }).then(async (response) => {
      const result = await response.json()  
      if (result["status"] == true){   
        setRowData(result['data'])
        setIsLoading(false);
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

  const onChangeKamus =  (newValue: SingleValue<OptionsModel>) => {  
    if (newValue) {
      // value
      selectedKamus.current = {label: newValue!.label, value: newValue!.value}; 
      // call
      fetchData()
    }
  };

  function clearKamus() {  
    // value
    selectedKamus.current = {label: '', value: ''} 
    // ref 
    selectInputKamus.current?.clearValue();   
    // list
    fetchData()
  }
  


  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ">
      
      {/* title */}
      <div className="px-6 py-5 flex flex-col gap-5 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Data
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Data berkaitan dengan wilayah
          </p>
        </div> 
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6"> 
 
        <div className="col-span-8 mb-4">
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
        
        <div style={{ height: 500 }}>
          <AgGridReact 
              rowData={rowData}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
              loading={isLoading}
              overlayLoadingTemplate={'<span class="ag-overlay-loading-center">Loading...</span>'}
              overlayNoRowsTemplate={'<span class="ag-overlay-loading-center">No rows to show</span>'}
          />
        </div>
      </div>

    </div> 
  );
}