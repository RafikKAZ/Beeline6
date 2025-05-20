document.addEventListener("DOMContentLoaded", function () {
    let map, placemark;

    const cityCenters = {
        "Алматы": [43.238949, 76.889709],
        "Астана": [51.169392, 71.449074],
        "Костанай": [53.219913, 63.624630],
        "Шымкент": [42.341731, 69.590099]
        // ... добавь другие города при необходимости ...
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
            if (placemark) {
                placemark.geometry.setCoordinates(coords);
            } else {
                placemark = createPlacemark(coords);
                map.geoObjects.add(placemark);
            }
            getAddress(coords);
        });

        document.getElementById("city").addEventListener("change", function () {
            const selectedCity = this.value;
            if (cityCenters[selectedCity]) {
                map.setCenter(cityCenters[selectedCity], 10);
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

            const preview = document.getElementById("selected-address");
            if (preview) {
                preview.innerText = 'Выбранный адрес: ' + address;
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
            alert("Пожалуйста, заполните все поля, включая 'Адрес дома' и 'Координаты'.");
            return;
        }

        const formData = new FormData(event.target);

        try {
            const response = await fetch("https://script.google.com/macros/s/AKfycbwAj5jmO20rc5_0ZjvgaVlBUc2pmnNFbh4NdhjIvknYZR_ByQI_QI2aNBjLPWhrkn1Ltg/exec", {
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
        }

        const preview = document.getElementById("selected-address");
        if (preview) preview.innerText = 'Адрес не выбран';

        const confirmation = document.getElementById("confirmation");
        if (confirmation) confirmation.classList.add("hidden");
    }

    // 🔒 Ограничения ввода

    // ФИО — только кириллические и казахские буквы, пробел и дефис
    document.getElementById("name").addEventListener("input", function () {
        this.value = this.value.replace(/[^А-Яа-яЁёӘәӨөҚқҢңҰұҮүҺһІі\s\-]/g, '');
    });

    // Телефон — только цифры
    document.getElementById("phone").addEventListener
