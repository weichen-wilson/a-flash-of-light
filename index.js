let service;
let position;
let restaurants;

const initialize = async function () {
  // 創建一個 Html Tag 容器給 google map API 使用
  const container = document.createElement('div');

  // 創建一個 google map 的服務器
  service = new google.maps.places.PlacesService(container);

  // 設定監聽選項顯示功能
  document.getElementById('selectAll').addEventListener('click', e => selectAll());

  const options = document.getElementsByName('options');
  options.forEach(option => option.addEventListener('click', () => {
    const all = document.getElementById('selectAll');
    let checkedCount = 0;
    options.forEach(o => {
      if (o.checked) checkedCount++;
    });

    switch (checkedCount) {
      case 0:
        all.checked = false;
        all.indeterminate = false;
        break;
      case options.length:
        all.checked = true;
        all.indeterminate = false;
        break;
      default:
        all.checked = false;
        all.indeterminate = true;
        break;
    }

    // 隱藏結果的 Element
    document.getElementsByClassName('restaurant')[0].style.display = 'none';

    resetSearchBtn();
  }));

  // 設定使用者位置
  navigator.geolocation.getCurrentPosition(
    ({ coords: { latitude, longitude } }) => {
      // 取得使用者的位置並設定在 google map 上
      position = new google.maps.LatLng(latitude, longitude);

      // 開啟搜尋按鈕功能
      const searchBtn = document.getElementById('search');
      searchBtn.classList.remove('btn-outline-secondary');
      searchBtn.classList.add('btn-outline-success');
      searchBtn.removeAttribute('disabled');
      searchBtn.innerText = '開始搜尋～';
    },
    (error) => console.log(error),
    { timeout: 5000 }
  );
}

const search = function () {
  // 隱藏結果的 Element
  document.getElementsByClassName('restaurant')[0].style.display = 'none';

  // 設定 google map 服務器的 Request Body
  const request = {
    location: position,
    radius: '150',
    keyword: getKeywords() || ['food'],
    openNow: true,
    rankBy: google.maps.places.RankBy.PROMINENCE,
    type: ['restaurant']
  };

  // 
  service.nearbySearch(
    request,
    (results, status, pagination) => {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        restaurants = results;
        chooseOne();

        // 顯示結果的 Element
        document.getElementsByClassName('restaurant')[0].style.display = 'flex';

        // 更新按鈕
        const searchBtn = document.getElementById('search');
        searchBtn.classList.remove('btn-outline-success');
        searchBtn.classList.add('btn-outline-danger');
        searchBtn.innerText = '我想換一家QQ';
        searchBtn.onclick = chooseOne;
      }
    }
  );
}

const chooseOne = function () {
  const randomNum = Math.floor(Math.random() * restaurants.length);
  
  const restaurant = restaurants.splice(randomNum, 1)[0];
  // 如果有
  if (!!restaurant) {
    // 更新查詢結果圖片
    const restaurantPhoto = document.querySelector('.restaurant>img');
    restaurantPhoto.src = (restaurant.photos && restaurant.photos[0].getUrl()) || '/a_flash_of_light/static/fake.jpg';
    
    // 更新查詢結果資訊
    const restaurantName = document.querySelector('.restaurant>a');
    restaurantName.innerText = restaurant.name;
    restaurantName.href = `https://www.google.com/maps/search/?api=1&query=${restaurant.name}`;
  } else {
    // 設定圖片
    document.querySelector('.restaurant>img').src = '/a_flash_of_light/static/no-picture.jpg';
    
    // 更改文字訊息
    const restaurantName = document.querySelector('.restaurant>a');
    restaurantName.innerText = 'Oops～看來找不到你喜歡的餐廳，請重新設定條件再查詢看看，或點我開起 Google Map 查詢附近的餐廳';
    restaurantName.href = 'https://www.google.com/maps/search/?api=1&query=餐廳';

    // 更新按鈕
    resetSearchBtn();
  }
}

const getKeywords = function () {
  const options = document.getElementsByName('options');
  let keyword = [];

  options.forEach(o => {
    if (o.checked) { keyword.push(o.defaultValue); }
  });

  return (keyword.length && keyword) || null;
}

const selectAll = function () {
  const all = document.getElementById('selectAll');
  const options = document.getElementsByName('options');
  options.forEach(o => o.checked = all.checked );
}

const resetSearchBtn = function () {
  const searchBtn = document.getElementById('search');
  searchBtn.classList.remove('btn-outline-danger');
  searchBtn.classList.add('btn-outline-success');
  searchBtn.innerText = '開始搜尋～';
  searchBtn.onclick = search;
}

window.initialize = initialize;