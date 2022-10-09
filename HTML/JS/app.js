let weatherApiKey = '9d052754ba3442a330c1544826a95a17';
let weatherBaseEndPoint ='https://api.openweathermap.org/data/2.5/weather?units=metric&appid='+weatherApiKey;
let forecastEndpoint ='https://api.openweathermap.org/data/2.5/forecast?units=metric&appid='+ weatherApiKey;
// ---------------------------VARIABLE-------------------------------
let searchInp = document.querySelector('.search');
let city = document.querySelector('.w-city');
let day = document.querySelector('.w-day');
let humidity = document.querySelector('.w-indicator-hum>.value');
let wind = document.querySelector('.w-indicator-wind>.value');
let pressure = document.querySelector('.w-indicator-prs>.value');
let image = document.querySelector('.weather-img');
let tempe = document.querySelector('.w-temp');  
let forecastBlock =document.querySelector('.w-forecast');
let cityBaseEndpoint = 'https://api.teleport.org/api/cities/?search=';
let suggest = document.querySelector('#suggest');   

let weatherImages =[ 
    {
        url : 'images/clear-sky.png',
        ids:[800]
    },
    {
        url : 'images/broken-clouds.png',
        ids:[803, 804]
    },
    {
        url : 'images/few-clouds.png',
        ids:[801 ]
    },
    {
        url : 'images/mist.png',
        ids:[701,711,721,731,741,751,761,762,771,781]
    },
    {
        url : 'images/rain.png',
        ids:[500,501,503,504]
    },
    {
        url : 'images/scattered-clouds.png',
        ids:[802]
    },
    
    {
        url : 'images/shower-rain.png',
        ids:[520,521,522,300,302,310,311,312,313,314,321]
    },
    
    {
        url : 'images/snow.png',
        ids:[511,600,601,602,611,612,613,615]
    },
    
    {
        url : 'images/thunderstorm.png',
        ids:[200,201,202,210,211,212,221,230,231,232]
    },

]



// ++++++++++++++++++++++++++++++++++
let getWeatherCity = async(cityString) =>{
    let city;
    if(cityString.includes(',')){
        city = cityString.substring(0,cityString.indexOf(','))+ cityString.substring(cityString.lastIndexOf(','));
    }
    else{
        city = cityString;
    }
    let endPoint = weatherBaseEndPoint +"&q="+ city;
    let response = await fetch(endPoint);
    if(response.status != 200){
        alert("City Not Found");
        return;
    }
    let weather = await response.json();
    return weather;    
}
let getForecastbyCity = async(id)=>{
    let endPoint = forecastEndpoint +"&id="+ id;
    let result = await fetch(endPoint);
    let forecast = await result.json();
    console.log(forecast);
    let forecastList = forecast.list;
    let daily = [];

        forecastList.forEach(day => {
            let date = new Date(day.dt_txt.replace(' ','T'));
            let hours = date.getHours();
            if(hours === 12){
                daily.push(day);
            }
        })
       
        return daily;
       
}
// ----------------------------------------------------------
// Default
let weatherForCity = async(city) =>{
    let weather = await getWeatherCity(city);
        if(!weather){
            return;
        }
        updateCurrentWeather(weather);
        let cityId =weather.id;
        let forecast =await getForecastbyCity(cityId);
        updateForecast(forecast); 

        
}
let init = ()=>{
    weatherForCity('Surat').then(()=> document.body.style.filter = 'blur(0)');
}
init();

searchInp.addEventListener('keydown',async(e)=>{
    if(e.keyCode === 13){
        weatherForCity(searchInp.value);
       
    }
})
searchInp.addEventListener('input', async () => {
    let endpoint = cityBaseEndpoint + searchInp.value;
    let result = await (await fetch(endpoint)).json();
    console.log(result);
    suggest.innerHTML = '';
    let cities  = result._embedded['city:search-results'];
    let length = cities.length > 5 ? 5 : cities.length;
    for(let i = 0; i < length; i++) {
        let option = document.createElement('option');
        option.value = cities[i].matching_full_name;
        suggest.appendChild(option);
    }
})
// ---------------------------------------------------
let updateCurrentWeather = (data)=>{
    city.textContent  = data.name + ' , '+ data.sys.country;
    day.textContent = dayOfWeek();
    humidity.textContent = data.main.humidity;
    pressure.textContent = data.main.pressure;
    // ******WIND*********
    let windDircttion;
    let deg =data.wind.deg;
    if(deg>45 && deg<135){
        windDircttion = 'East';
    }
    else if(deg<135 && deg>225){
        windDircttion = 'South';
    }
    else if(deg <225 && deg>315){
        windDircttion = 'West';
    }
    else{
        windDircttion='North'; 
    }
    wind.textContent = windDircttion+', '+ data.wind.speed;
    tempe.textContent = data.main.temp > 0 ?
                             '+' +Math.round(data.main.temp) : 
                                    Math.round(data.main.temp);
    let imgId = data.weather[0].id;
    weatherImages.forEach(obj => {
        if(obj.ids.includes(imgId)){
            image.src = obj.url;
        }
    })

}
// -------------------UPDATE FORECAST----------------------------
let updateForecast = (forecast) =>{
    forecastBlock.innerHTML = '';
    forecast.forEach(day =>{
        let iconUrl = ' http://openweathermap.org/img/wn/'+day.weather[0].icon + '@2x.png';
        let dayName =dayOfWeek(day.dt * 1000); 
        let temp = day.main.temp > 0 ?
        '+' +Math.round(day.main.temp) : 
               Math.round(day.main.temp);
        let forecastItem = ` <article class="w-item col ">
                                <img src="${iconUrl}" alt = "${day.weather[0].description}" class="w-icon">
                                <h3 class="f-day">${dayName}</h3>
                                <p class="f-temp"><span class="value">${temp}</span>&deg;C</p>
                            </article>`;
         forecastBlock.insertAdjacentHTML('beforeend',forecastItem);
    })

}

// -------------------------------------------
let dayOfWeek =(dt = new Date().getTime())=>{
    return new Date(dt).toLocaleDateString('en-EN',{'weekday':'long'});

}



