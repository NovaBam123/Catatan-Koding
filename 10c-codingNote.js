console.log('SimpleMDE:', typeof SimpleMDE); // harusnya 'function'
console.log('marked:', typeof marked); 

const formCatatan= document.getElementById('form-catatan');
const bukaFormBtn= document.getElementById('buka-form-btn');
const tutupFormIcon= document.getElementById('tutup-form');
const tambahCatatan= document.getElementById('tambah-catatan');
const catatanKontainer= document.getElementById('catatan-container');
const judulInput= document.getElementById('judul-input');
const tanggalInput= document.getElementById('tanggal-input');
const deskripsiInput= document.getElementById('deskripsi-input');

let simpleMde;

// Inisiasi simpleMDE library
document.addEventListener('DOMContentLoaded', ()=> {
    simpleMde= new SimpleMDE({ el: deskripsiInput });
    tampilkanCatatan();
})

const dataCatatan= JSON.parse(localStorage.getItem('Catatan-Koding')) || [];
let catatanSaatIni= {};

const tambahOrUpdateCatatan= ()=> {
    const dataIdxSaatIni= dataCatatan.findIndex(item=> item.id === catatanSaatIni.id);
    const deskripsiMarkdown= simpleMde.value();

    if(!judulInput.value.trim()|| !deskripsiMarkdown.trim()) return;
    objCatatan= {
        id: catatanSaatIni.id || `${judulInput.value.toLowerCase().split(' ').join('-')}-${Date.now()}`,
        judul: judulInput.value,
        tanggal: tanggalInput.value,
        deskripsi: deskripsiMarkdown,
    }
    console.log('idxSaatIni:', dataIdxSaatIni);
    if(dataIdxSaatIni=== -1){
        dataCatatan.unshift(objCatatan);
    }else{
        dataCatatan[dataIdxSaatIni]= objCatatan; //editi catatan;
    }
    localStorage.setItem('Catatan-Koding', JSON.stringify(dataCatatan));
    tampilkanCatatan();
    reset();
}
const tampilkanCatatan= ()=> {
    catatanKontainer.innerHTML= '';
    dataCatatan.forEach(
        ({id, judul, tanggal, deskripsi})=> {
            catatanKontainer.innerHTML+= `
            <div class="catatan" id="${id}">
                <p><strong>Judul:</strong> ${judul}</p>
                <p><strong>Tanggal:</strong> ${tanggal}</p>
                <div><strong>Deskripsi:</strong> ${marked.parse(deskripsi)}</div>
                <button type="button" class="btn" onclick="editCatatan(this)">Edit</button>
                <button type="button" class="btn" onclick="hapusCatatan(this)">Hapus</button>
                <div class="divider"></divider>
            </div>
            `
        }
    )
}
const hapusCatatan= (btnEl)=> {
    const idxCatatanSaatIni= dataCatatan.findIndex(item=> item.id=== btnEl.parentElement.id);
    let yakindiHapus= confirm('Yakin Catatan ini dihapus?');
    if(yakindiHapus){
        btnEl.parentElement.remove();
        dataCatatan.splice(idxCatatanSaatIni, 1);
        localStorage.setItem('Catatan-Koding', JSON.stringify(dataCatatan));
    }else {
        return;
    }
}
const editCatatan= (btnEl)=> {
    const idxCatatanSaatIni= dataCatatan.findIndex(item=> item.id=== btnEl.parentElement.id);
    catatanSaatIni= dataCatatan[idxCatatanSaatIni];
    judulInput.value= catatanSaatIni.judul;
    tanggalInput.value= catatanSaatIni.tanggal;
    simpleMde.value(catatanSaatIni.deskripsi);
    tambahCatatan.textContent= 'Edit Catatan';
    formCatatan.classList.add('show');
}
const reset= ()=> {
    tambahCatatan.textContent= 'TAMBAH CATATAN';
    judulInput.value= '';
    simpleMde.value('');
    catatanSaatIni= {};
    formCatatan.classList.remove('show');
}

//EvenListener
bukaFormBtn.addEventListener('click', ()=> {
    formCatatan.classList.add('show');
})
tutupFormIcon.addEventListener('click', ()=> {
    const cekFormInputAdaData= judulInput.value || simpleMde.value();
    const cekFormInputDiEdit= 
        judulInput.value!== catatanSaatIni.judul || 
        tanggalInput.value!== catatanSaatIni.tanggal || 
        simpleMde.value()!== catatanSaatIni.deskripsi;
    if(cekFormInputAdaData && cekFormInputDiEdit) {
        let konfirmasi= confirm('Tutup form dan abaikan perubahan?')    
        if(konfirmasi) reset();
        else return;
    }else {
        reset();
    }    
});
formCatatan.addEventListener('submit', (e)=> {
    e.preventDefault();
    tambahOrUpdateCatatan();
});

//SAVE DATA FROM LOCAL STORAGE
const exportBtn= document.getElementById('exportBtn');
const importBtn= document.getElementById('importBtn');
const fileInput= document.getElementById('fileInput');
const deleteBtn= document.getElementById('deleteBtn');

//EXPORT DATA
exportBtn.addEventListener('click', ()=>{
    const data= {};
    const keys= ['Catatan-Koding'];
    keys.forEach(key=> {
        const value= localStorage.getItem(key);
        if(value){
            data[key]= value;
        }
    })
    if (Object.keys(data).length === 0) {
        alert("Tidak ada data yang bisa diekspor.");
        return;
    }
    const blob= new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
    })
    const link= document.createElement('a');
    link.href= URL.createObjectURL(blob);
    link.download= 'catatanKoding.json';
    link.addEventListener('click', ()=> {
        setTimeout(()=> alert('Transfer Berhasil..!'), 100);
    })
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
})

importBtn.addEventListener('click', ()=> {
    if(fileInput.files.length=== 0){
        alert('Silahkan pilih file.');
        return;
    }
    const file= fileInput.files[0];
    const reader= new FileReader();
    reader.onload= (e)=> {
        try {
           const data= JSON.parse(e.target.result);
           Object.keys(data).forEach(key=> {
              localStorage.setItem(key, data[key]);
           })
           alert('Import Berhasil..!')
        }catch(err) {
            alert(`Oops, Gagal import! ${err.message}`);
        }
    }
    reader.readAsText(file);
})

deleteBtn.addEventListener('click', ()=> {
    let konfirmasi= confirm('Peringatan! seluruh data localStorage akan dihapus?')
    if(konfirmasi){
        localStorage.clear();
        tampilkanCatatan();
    }else{
        return;
    }
});


