document.addEventListener("DOMContentLoaded", function () {
    let map, placemark;

    const cityCenters = {
        "Алматы": [43.238949, 76.889709],
        "Астана": [51.169392, 71.449074],
        "Костанай": [53.219913, 63.624630],
        "Шымкент": [42.341731, 69.590099],
        "Актау": [43.651070, 51.153300],
        "Актобе": [50.283937, 57.166978],
        "Атырау": [47.094495, 51.923771],
        "Караганда": [49.806066, 73.085358],
        "Кокшетау": [53.294822, 69.404787],
        "Кызылорда": [44.848831, 65.482267],
        "Павлодар": [52.287054, 76.967928],
        "Петропавловск": [54.877876, 69.140651],
        "Талдыкорган": [45.015245, 78.375034],
        "Тараз": [42.899879, 71.377946],
        "Уральск": [51.230942, 51.386524],
        "Усть-Каменогорск": [49.948235, 82.615358],
        "Темиртау": [50.054938, 72.959289],
        "Риддер": [50.344848, 83.512650],
        "Рудный": [52.964454, 63.133419],
        "Жезказган": [47.803837, 67.707956],
        "Сатпаев": [47.881482, 67.540070],
        "Балхаш": [46.844658, 75.996928],
        "Кентау": [43.520079, 68.512026],
        "Шахтинск": [49.701231, 72.591820],
        "Сарань": [49.790466, 72.805327],
        "Щучинск": [52.934115, 70.189818],
        "Аксу": [52.046584, 76.918110],
        "Лисаковск": [52.548712, 62.497317],
        "Житикара": [52.183928, 61.189833],
        "Конаев": [43.854849, 77.061581],
        "Кандагаш": [48.487661, 57.595688]
    };

    ymaps.ready(initMap);

    function initMap() {
        const defaultCity = document.getElementById("city").value;
        map = new ymaps.Map("map", {
            center: cityCenters[defaultCity],
            zoom: 10
        });

        map.events.add("click", function (e) {
            const coords = e.get("coords");
            setPlacemarkAndAddress(coords);
        });

        document.getElementById("city").addEventListener("change", function () {
            const selectedCity = this.value;
            if (cityCenters[selectedCity]) {
                map.setCenter(cityCenters[selectedCity], 10);
            }
        });

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    const userCoords = [position.coords.latitude, position.coords.longitude];
                    map.setCenter(userCoords, 16);
                    setPlacemarkAndAddress(userCoords);
                },
                function (error) {
                    console.warn("Геолокация недоступна:", error.message);
                }
            );
        }
    }

    function createPlacemark(coords) {
        return new ymaps.Placemark(coords, {}, {
            preset: "islands#blueDotIcon",
            draggable: false
        });
    }

    function setPlacemarkAndAddress(coords) {
        if (placemark) {
            placemark.geometry.setCoordinates(coords);
        } else {
            placemark = createPlacemark(coords);
            map.geoObjects.add(placemark);
        }
        getAddress(coords);
    }

    function getAddress(coords) {
        ymaps.geocode(coords).then(function (res) {
            const firstGeoObject = res.geoObjects.get(0);
            const address = firstGeoObject.getAddressLine();

            document.getElementById("address").value = address;
            document.getElementById("coordinates").value = coords.join(", ");

            const preview = document.getElementById("selected-address");
            if (preview) {
                preview.innerText = 'Выбранный адрес: ' + address;
            }

            const citySelect = document.getElementById("city");
            let detectedCity = firstGeoObject.getLocalities()[0];
            if (!detectedCity) {
                detectedCity = firstGeoObject.getAdministrativeAreas()[0];
            }

            if (detectedCity) {
                const detected = detectedCity.toLowerCase();
                let matched = false;
                for (let i = 0; i < citySelect.options.length; i++) {
                    const optionText = citySelect.options[i].text.toLowerCase();
                    if (optionText.includes(detected)) {
                        citySelect.selectedIndex = i;
                        matched = true;
                        break;
                    }
                }

                const detectedCityInput = document.getElementById("detected_city");
                if (detectedCityInput) {
                    detectedCityInput.value = detectedCity;
                }

                if (!matched) {
                    const customOption = new Option(detectedCity, detectedCity, true, true);
                    citySelect.add(customOption, 0);
                    citySelect.selectedIndex = 0;
                }
            }

            const confirmation = document.getElementById("confirmation");
            if (confirmation) {
                confirmation.classList.remove("hidden");
                setTimeout(() => {
                    confirmation.classList.add("hidden");
                }, 3000);
            }
        });
    }

    document.getElementById("submissionForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const address = document.getElementById("address").value.trim();
        const coordinates = document.getElementById("coordinates").value.trim();

        if (address === "" || coordinates === "") {
            alert("Пожалуйста, выберите адрес дома на карте или включите геолокацию для автоматически выбора адреса.");
            return;
        }

        const formData = new FormData(event.target);

        try {
            const response = await fetch("https://script.google.com/macros/s/AKfycbzYzjOR2aILX3R41f49v71M7HJFWgz6T0jK0857_dyjkoa6wxobJqxoFsb3UDqQLCy1xg/exec", {
                method: "POST",
                body: formData,
            });

            const result = await response.text();
            alert(result);
            resetForm();

        } catch (error) {
            console.error("Ошибка:", error);
            alert("Произошла ошибка при отправке данных.");
        }
    });

    function resetForm() {
        document.getElementById("submissionForm").reset();
        if (placemark) {
            map.geoObjects.remove(placemark);
            placemark = null;
        }

        const preview = document.getElementById("selected-address");
        if (preview) preview.innerText = 'Адрес не выбран';

        const confirmation = document.getElementById("confirmation");
        if (confirmation) confirmation.classList.add("hidden");
    }

    document.getElementById("name").addEventListener("input", function () {
        this.value = this.value.replace(/[^А-Яа-яЁёӘәӨөҚқҢңҰұҮүҺһІі\\s\\-]/g, '');
    });

    document.getElementById("phone").addEventListener("input", function () {
        this.value = this.value.replace(/[^\d]/g, '');
    });
});
