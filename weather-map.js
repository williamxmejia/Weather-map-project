"use strict";

mapboxgl.accessToken = MAPBOX_API_TOKEN;

let start;

// console.log(navigator)

navigator.geolocation.getCurrentPosition((mapEvent)=>{
    let latitude = mapEvent.coords.latitude;
    let longitude = mapEvent.coords.longitude;
    let coords = [longitude, latitude];
    start = coords;

    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${start}.json?access_token=${MAPBOX_API_TOKEN}`)
        .then(async (response) => {
            let data = await response.json();
            document.getElementById('location').innerHTML = `${data.features[3].text}`;
        });


const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: start,
    zoom: 9
})

    const marker = new mapboxgl.Marker()
        .setLngLat(start)
        .addTo(map)

    marker.setDraggable(true);

    let url = new URL('http://api.openweathermap.org/data/2.5/onecall')
    url.search = new URLSearchParams({
        lat: latitude,
        lon: longitude,
        appid: OPEN_WEATHER_APPID,
        exclude: 'minutely,hourly,alerts',
        units: 'imperial',
    })
    fetch(url).then(async(response) =>{
        let data = await response.json();
        cardDataDisplay(data);
    });

marker.on('dragend', () => {
    let long1 = marker.getLngLat().lng;
    let lat1 = marker.getLngLat().lat;
    let coord1 = [long1, lat1];
    gettingWeather(lat1, long1);
    // console.log(coord1);
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coord1}.json?access_token=${MAPBOX_API_TOKEN}`)
        .then(async (response) => {
            let data = await response.json();
            console.log(data.features[2].context[2].text);
            document.getElementById('location').innerHTML = `${data.features[3].text}`;
        });
    fetch(url).then(async (response) => {
        let data = await response.json();
        cardDataDisplay(data);
    })
});

    let submitBtn = document.getElementById("submit");
    let form = document.getElementById('form');
    submitBtn.addEventListener("click", (e)=>{
        e.preventDefault();
        geocode(form.value, MAPBOX_API_TOKEN).then(async (data) =>{
            map.setCenter(data);
            marker.setLngLat(data);
            let long = marker.getLngLat().lng;
            let lat = marker.getLngLat().lat;
            let coordinate = [long, lat];
            gettingWeather(coordinate);
            fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinate}.json?access_token=${MAPBOX_API_TOKEN}`)
                .then(async (response) => {
                    let data = await response.json();
                    console.log(data)
                    document.getElementById('location').innerHTML = `${data.features[3].text}`;
                    form.value = "";
                    // document.getElementById('location').innerHTML = form.value;
                })
                })
        })

    function gettingWeather(lat, lon){
        let url = new URL('http://api.openweathermap.org/data/2.5/onecall')
        url.search = new URLSearchParams({
            lat: marker.getLngLat().lat,
            lon: marker.getLngLat().lng,
            appid: OPEN_WEATHER_APPID,
            exclude: 'minutely,hourly,alerts',
            units: 'imperial',
        });

        fetch(url).then( async (response) => {
            let data = await response.json();
            console.log(data);
            cardDataDisplay(data);
        })
    };

}, () =>{
    console.log("error getting location")
});

function cardDataDisplay(data){
    let html ="";
    for (let i = 0; i < 5; i++){
        let inner = document.getElementById('info');
        let date = new Date(Date.now() + 1000 * 60 * 60 * 24 * i).toDateString();
        inner.innerHTML =
            html +=
                `<div class="card-group flex-row my-5">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-header back">${date}</h5>
                                    <p class="card-text">${data.daily[i].temp.day} &#8457 / ${data.daily[i].temp.min} &#8457</p>
                                    <p class="card-text">Description: ${data.daily[i].weather[0].description}</p>
                                    <img src="http://openweathermap.org/img/wn/${data.daily[i].weather[0].icon}.png" class="w-50 mx-5" alt="">
                                    <p class="card-text">Humidity: ${data.daily[i].humidity}</p>
                                    <p class="card-text">Wind: ${data.daily[i].wind_speed}</p>
                                    <p class="card-text">Pressure: ${data.daily[i].pressure} </p>
                            </div>
                        </div>
                    </div>`
    }
    return html
}