
const BACKEND_URL = `http://localhost:3000`
//Set Your Backend URL here

let page = 1;
const NextButton = document.querySelector("#next")
const PreviousButton = document.querySelector("#prev")
const currentPageNumber = document.querySelector("#pageNumber")
let TotalPage = document.querySelector("#totalPageNumber").innerText;

PreviousButton.addEventListener("click", function () { changePage(-1) })
NextButton.addEventListener("click", function () { changePage(+1) })

function setPageNumberatInput(pageNo) {
    console.log(pageNo)
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

function setTotalPage() {
    document.getElementById("totalPageNumber").innerText = ''
    document.getElementById("totalPageNumber").innerText = TotalPage
}

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
    setPageNumberatInput(page)
    DisablePaginationButton()
    updateCampground().then((res) => {
        if (!res.campgrounds)
            console.log("Something went wrong")
    })
        .catch((error) => {
            console.log(error)
        })
}



const sortSelect = document.getElementById('sort');
let sort = '';
let selectedSorting = ''
sortSelect.addEventListener('change', (e) => {
    selectedSorting = e.target.value
});
function updateOnChangingSortingOrder() {
    setPageNumberatInput(page)
    DisablePaginationButton()
}


const setCampGrounds = (data) => {
    const campgroundList = document.getElementById("campground-list");

    campgroundList.innerHTML = '';

    data.forEach(campground => {
        const cardHTML = `
            <div class="card text-white bg-dark mb-3" id="campinfo">
                <div class="row">
                    <div class="col-md-4" id="campgroundhomeimage">
                        ${campground.images.length
                ? `<img crossorigin="anonymous" id="indeximg" alt="" src="${campground.images[0].url}">`
                : `<img crossorigin="anonymous" class="img-fluid" src="https://res-console.cloudinary.com/dgr21eiov/media_explorer_thumbnails/149d48129829d71b6f4ffd8347709f20/detailed" alt="">`
            }
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${campground.title}</h5>
                            <p class="card-text">${campground.description}</p>
                            <p class="card-text">
                                <small id="infolocation">${campground.location}</small>
                            </p>
                            <a href="/campgrounds/${campground._id}" class="btn btn-primary">View ${campground.title}</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        campgroundList.insertAdjacentHTML('beforeend', cardHTML);
    });
};


const updateCampground = async () => {
    if (sort)
        url = `${BACKEND_URL}/campgrounds/api/campgrounds?sort=${sort}&page=${page}`;
    else
        url = `${BACKEND_URL}/campgrounds/api/campgrounds?page=${page}`;
    try {
        const response = await fetch(url, {
            method: "GET",
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        // console.log(response)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        setCampGrounds(data.campgrounds)
        TotalPage = data.totalPage
        console.log(TotalPage)
        setTotalPage()
        return data
    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

let campgrounds
const sortingForm = document.querySelector(`#campground-arrangement`)
sortingForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    sort = selectedSorting
    page = 1;
    updateCampground().then((res) => {
        if (!res)
            console.log("Something went wrong")
        else
            updateOnChangingSortingOrder()
    })
        .catch((error) => {
            console.log(error)
        })
});