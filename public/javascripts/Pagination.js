let page = 1;
const NextButton = document.querySelector("#next")
const PreviousButton = document.querySelector("#prev")
const currentPageNumber = document.querySelector("#pageNumber")
let TotalPage = document.querySelector("#totalPageNumber").innerText;
const sortSelect = document.getElementById('sort');
let sort = 'select'
let selectedSorting = ''
let searchTag = null
const searchElement = document.getElementById('search-input')
PreviousButton.addEventListener("click", function () { changePage(-1) })
NextButton.addEventListener("click", function () { changePage(+1) })


function setSortAndPage() {

    const url = new URL(window.location.href);


    const params = new URLSearchParams(url.search);


    sort = params.get('sort') || 'select';
    page = params.get('page') || 1;
    page = parseInt(page, 10)
    setPageNumberatInput(page)
    searchTag = params.get('q') || null
    if (searchTag)
        searchElement.value = searchTag
}
setSortAndPage()
sortSelect.value = sort

function changePageLocation(url) {
    window.location = url
}

function setPageNumberatInput(pageNo) {
    currentPageNumber.value = pageNo
}

currentPageNumber.addEventListener('change', (e) => {
    const targetPage = e.target.value
    if (targetPage == page)
        return
    if (targetPage < 1 || targetPage > TotalPage)
        setPageNumberatInput(page)
    else
        changePage(targetPage - page)
})

setPageNumberatInput(page)
function setPage(pageNo) {
    if (pageNo >= 1) {
        page = setPage
        setPageNumberatInput(page)
    }
}
function DisablePaginationButton() {
    if (page == 1)
        PreviousButton.style.transform = `scale(0)`
    else
        PreviousButton.style.transform = `scale(1)`
    if (page == TotalPage)
        NextButton.style.transform = `scale(0)`
    else
        NextButton.style.transform = `scale(1)`
}
DisablePaginationButton()

function changePage(increment) {
    const newPage = page + increment;
    if (newPage < 1) return; // Prevent going below page 1
    if (newPage > TotalPage) return;
    page = newPage;
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('sort', sort);
    currentUrl.searchParams.set('page', page);
    console.log(currentUrl.toString())
    changePageLocation(currentUrl.toString());
}

sortSelect.addEventListener('change', (e) => {
    selectedSorting = e.target.value
});
function updateOnChangingSortingOrder() {
    setPageNumberatInput(page)
    DisablePaginationButton()
}

const getLocation = () => {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        } else {
            reject(new Error("Geolocation is not supported by this browser."));
        }
    });
};

const sortingForm = document.querySelector(`#campground-arrangement`)
sortingForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    sort = selectedSorting
    page = 1;
    window.location = window.location.origin + `/campgrounds?sort=${sort}&page=${page}`
    return
});