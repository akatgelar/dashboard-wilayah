import Swal from 'sweetalert2'

export function showLoading() {
    Swal.fire({
        title: 'Loading, please wait...',
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        }
    })
}
