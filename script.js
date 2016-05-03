ymaps.ready(function () {
	var myPlacemark;
    var myMap = new ymaps.Map('map', {
            center: [50.0, 36.20],
            zoom: 12,
            behaviors: ['default', 'scrollZoom']
        }, {
            searchControlProvider: 'yandex#search'
        }),
             // Создаем собственный макет с информацией о выбранном геообъекте.
		customItemContentLayout = ymaps.templateLayoutFactory.createClass(
        // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
        '<h2 class=ballon_header>{{ properties.balloonContentHeader|raw }}</h2>' +
            '<div class=ballon_body>{{ properties.balloonContentBody|raw }}</div>' +
            '<div class=ballon_footer>{{ properties.balloonContentFooter|raw }}</div>'
    ),
		clusterer = new ymaps.Clusterer({
        clusterDisableClickZoom: true,
        clusterOpenBalloonOnClick: true,
        // Устанавливаем стандартный макет балуна кластера "Карусель".
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        // Устанавливаем собственный макет.
        clusterBalloonItemContentLayout: customItemContentLayout,
        // Устанавливаем режим открытия балуна. 
        // В данном примере балун никогда не будет открываться в режиме панели.
        clusterBalloonPanelMaxMapArea: 0,
        // Устанавливаем размеры макета контента балуна (в пикселях).
        clusterBalloonContentLayoutWidth: 200,
        clusterBalloonContentLayoutHeight: 130,
        // Устанавливаем максимальное количество элементов в нижней панели на одной странице
        clusterBalloonPagerSize: 5
       
    }),
            getPointData = function (index) {
            return {
                balloonContentBody: 'балун <strong>метки ' + index + '</strong>',
                clusterCaption: 'метка <strong>' + index + '</strong>'
            };
        },
            getPointOptions = function () {
            return {
                preset: 'islands#violetIcon'
            };
        },
       points = [
            [49.951903,36.211961], [49.953972,36.259610], [49.996188294179, 36.110912435790915], [49.981329,36.242781], [49.954708,36.248870], [49.953123,36.206067], [49.998585,36.254980]
        ],
        geoObjects = [];
    for(var i = 0, len = points.length; i < len; i++) {
        geoObjects[i] = new ymaps.Placemark(points[i], getPointData(i), getPointOptions());
    }
    clusterer.options.set({
        gridSize: 80,
        clusterDisableClickZoom: true
    });
    clusterer.add(geoObjects);
    myMap.geoObjects.add(clusterer);
    myMap.setBounds(clusterer.getBounds(), {
        checkZoomRange: true
    });
	
	// Слушаем клик на карте
    myMap.events.add('click', function (e) {
        var coords = e.get('coords'),
			address = getAddress(coords);
			
			
		
		address.then(function(gotAddress){
			console.log(gotAddress.properties.get('name'));
			
			/*окно добавления*/
			
			new Promise(function(resolve, reject){
				if (!myMap.balloon.isOpen()) {
            
            myMap.balloon.open(coords, {
				
                contentHeader:gotAddress.properties.get('name'),
                contentBody: '<p>Кто-то щелкнул по карте.</p>' +
				    '<p>Координаты щелчка: ' + [
                    coords[0].toPrecision(6),
                    coords[1].toPrecision(6)
                    ].join(', ') + '</p>'+'<input id="name" placeholder="Name"><br><input id="place" placeholder="Place"><br>'+'<textarea id="review" placeholder="review"></textarea>',
                contentFooter:'<button id="send">Send</button>'
            }setTimeout(console.log(send), 10000););
				console.log(document.getElementById('send'));
			}
			else {
				myMap.balloon.close();
			}
				
				resolve();
			}).then(function(){
				console.log('button', getElementsByTegName('button'));
				setTimeout(console.log(send), 2000);
				
			});
			
			setTimeout(console.log(document.getElementById('send')),  20000);
			console.log('button', getElementsByTegName('button'));
			/*окно добавления*/
			
			document.getElementById('send').addEventListener('click', function (e){
				alert(123);
				var name = name.value();
				var place = place.value();
				var text = review.value();
				
				placeMarkToMap(coords, gotAddress.properties.get('name'), name, place, text);
				 myMap.balloon.close();
			});
			
			
			
			
			var xhr = new XMLHttpRequest();
			
			xhr.open('post', 'http://localhost:3000/', true);
			xhr.send(JSON.stringify({
				op: 'add',
				review: {
					coords: {
						x: coords[0],
						y: coords[1]
					},
					address: gotAddress.properties.get('text'),
					name: name,
					place: place,
					text: text
				}
			}));
		});
    });

	function placeMarkToMap(coords, address, name, place, text){
		myPlacemark = createPlacemark(coords);
			myPlacemark.properties
                .set({
                    //iconContent: name,
					balloonContentHeader: place,
					balloonContentBody: text,
					balloonContentFooter: name
                });
		clusterer.add(myPlacemark);		
	};
	
    // Создание метки
    function createPlacemark(coords) {
        return new ymaps.Placemark(coords, {
            //iconContent: 'поиск...'
        }, {
            preset: 'islands#violetStretchyIcon',
            draggable: true
        });
    }

    // Определяем адрес по координатам (обратное геокодирование)
    function getAddress(coords) {
        return ymaps.geocode(coords).then(function (res) {
            return res.geoObjects.get(0);

        });
    };
	
	var xhr = new XMLHttpRequest();
		xhr.responseType = 'json';
		xhr.open('post', 'http://localhost:3000', true);
		xhr.onload = function(){
			console.log(xhr.response);
			for(var address in xhr.response){
				var reviews = xhr.response[address];
				reviews.forEach(function(review){
					placeMarkToMap([review.coords.x, review.coords.y], address, review.name, review.place, review.text);
					console.log(address);
					console.log(review.coords.x);
					console.log(review.name);
				});
			}
		};
		xhr.send(JSON.stringify({op: 'all'}));
	
});

/*
 center: [50.0, 36.20],
            zoom: 12,


 points = [
            [49.951903,36.211961], [49.953972,36.259610], [49.996188294179, 36.110912435790915], [49.981329,36.242781], [49.954708,36.248870], [49.953123,36.206067], [49.998585,36.254980]
        ],
*/
















