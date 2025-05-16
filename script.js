document.addEventListener("DOMContentLoaded", function () {
    // Карта Яндекс
    let map, placemark;

    // Центры городов
    const cityCenters = {
        "Алматы": [43.238949, 76.889709],
        "Астана": [51.169392, 71.449074],
        "Шымкент": [42.341731, 69.590099],
        "Актау": [43.651070, 51.153300],
        "Актобе": [50.283937, 57.166978],
        "Атырау": [47.094495, 51.923771],
        "Караганда": [49.806066, 73.085358],
        "Кокшетау": [53.294822, 69.404787],
        "Костанай": [53.219913, 63.624630],
        "Кызылорда": [44.848831, 65.482267],
        "Павлодар": [52.287054, 76.967928],
        "Петропавловск": [54.877876, 69.140651],
        "Талдыкорган": [45.015245, 78.375034],
        "Тараз": [42.899879, 71.377946],
        "Уральск": [51.230942, 51.386524],
        "Усть-Каменогорск": [49.948235, 82.615358],
        "Темиртау": [50.054938, 72.959289],
        "Риддер": [50.344848, 83.512650],
        "Жезказган": [47.803837, 67.707956],
        "Сатпаев": [47.881482, 67.540070],
        "Балхаш": [46.844658, 75.996928],
        "Кентау": [43.520079, 68.512026],
        "Шахтинск": [49.701231, 72.591820],
        "Сарань": [49.790466, 72.805327],
        "Щучинск": [52.934115, 70.189818],
        "Курчатов": [50.753168, 78.550736],
        "Аксу": [52.046584, 76.918110],
        "Лисаковск": [52.548712, 62.497317],
        "Рудный": [52.964454, 63.133419],
        "Житикара": [52.183928, 61.189833],
        "Конаев": [43.854849, 77.061581],
    };

    // Инициализация карты
    ymaps.ready(initMap);

    function initMap() {
        const defaultCity = document.getElementById("city").value;
        map = new ymaps.Map("map", {
            center: cityCenters[defaultCity],
            zoom: 10
        });

        map.events.add("click", function (e) {
            const coords = e.get("coords");
            if (placemark) {
                placemark.geometry.setCoordinates(coords);
            } else {
                placemark = createPlacemark(coords);
                map.geoObjects.add(placemark);
            }
            getAddress(coords);
        });

        // Обработчик изменения города
        document.getElementById("city").addEventListener("change", function () {
            const selectedCity = this.value;
            if (cityCenters[selectedCity]) {
                map.setCenter(cityCenters[selectedCity], 10); // Устанавливаем центр карты
            }
        });
    }

    function createPlacemark(coords) {
        return new ymaps.Placemark(coords, {}, {
            preset: "islands#blueDotIcon",
            draggable: false
        });
    }

    function getAddress(coords) {
        ymaps.geocode(coords).then(function (res) {
            const firstGeoObject = res.geoObjects.get(0);
            const address = firstGeoObject.getAddressLine();
            document.getElementById("address").value = address;
            document.getElementById("coordinates").value = coords.join(", ");
        });
    }

    // Отправка данных через форму
    document.getElementById("submissionForm").addEventListener("submit", async function (event) {
        event.preventDefault(); // Останавливаем отправку для проверки данных

        // Получаем значения полей
        const address = document.getElementById("address").value.trim();
        const coordinates = document.getElementById("coordinates").value.trim();

        // Проверяем, заполнены ли "Адрес дома" и "Координаты"
        if (address === "" || coordinates === "") {
            alert("Пожалуйста, заполните все поля, включая 'Адрес дома' и 'Координаты'.");
            return; // Прерываем выполнение, если поля не заполнены
        }

        const formData = new FormData(event.target);

        try {
            const response = await fetch("https://script.google.com/macros/s/AKfycbwAj5jmO20rc5_0ZjvgaVlBUc2pmnNFbh4NdhjIvknYZR_ByQI_QI2aNBjLPWhrkn1Ltg/exec", {
                method: "POST",
                body: formData,
            });

            const result = await response.text();
            alert(result);
             resetForm();  // Очищаем форму после отправки
            
        } catch (error) {
            console.error("Ошибка:", error);
            alert("Произошла ошибка при отправке данных.");
          
        }
    });

 // Функция для очистки формы
    function resetForm() {
        document.getElementById("submissionForm").reset();  // Сбрасывает значения формы
        // Удаляем маркер с карты
        if (placemark) {
            map.geoObjects.remove(placemark);
        }
    }
});
