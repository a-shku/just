ymaps.ready(function () {
	var myPlacemark;
    var myMap = new ymaps.Map('map', {
            center: [50.0, 36.20],
            zoom: 14,
            behaviors: ['default', 'scrollZoom']
        }, {
            searchControlProvider: 'yandex#search'
        }),
		/*тест макета*/
			 BalloonContentLayout = ymaps.templateLayoutFactory.createClass(
            '<div style="margin: 10px;">' +
                '<b>{{properties.name}}</b><br />' +
                '<i id="count"></i> ' +
                '<button id="counter-button"> +1 </button>' +
            '</div>', {

            // Переопределяем функцию build, чтобы при создании макета начинать
            // слушать событие click на кнопке-счетчике.
            build: function () {
                // Сначала вызываем метод build родительского класса.
                BalloonContentLayout.superclass.build.call(this);
                // А затем выполняем дополнительные действия.
                $('#counter-button').bind('click', this.onCounterClick);
                $('#count').html(counter);
            },

            // Аналогично переопределяем функцию clear, чтобы снять
            // прослушивание клика при удалении макета с карты.
            clear: function () {
                // Выполняем действия в обратном порядке - сначала снимаем слушателя,
                // а потом вызываем метод clear родительского класса.
                $('#counter-button').unbind('click', this.onCounterClick);
                BalloonContentLayout.superclass.clear.call(this);
            },

            onCounterClick: function () {
                $('#count').html(++counter);
                if (counter == 5) {
                    alert('Вы славно потрудились.');
                    counter = 0;
                    $('#count').html(counter);
                }
            }
        });
		/*тест макета*/
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
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        clusterBalloonItemContentLayout: customItemContentLayout,
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
            [49.951903,36.211961], [49.996188294179, 36.101912435790915], [49.981329,36.242781], [49.954708,36.248870], [49.953123,36.206067]
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
		//var present;
		address.then(function(gotAddress){
			console.log(gotAddress.properties.get('name'));
			
				/*get reviews*/
			new Promise(function(resolve, reject){
				var xhr = new XMLHttpRequest();
					xhr.responseType = 'json';
					
					xhr.open('post', 'http://localhost:3000/', true);
					xhr.send(JSON.stringify({
						op: 'get',
						address: gotAddress.properties.get('text'),
					}));
					xhr.onload = function(){
						console.log(xhr.response.length);

						resolve(xhr.response);
					};/*/get reviews*/
			}).then(function(present){
			/*окно добавления*/
			console.log(present);
			var wrapForRev;
			if(present.length < 1){
				wrapForRev = 'нет отзывов'
			} else{
				var list = document.createElement('ul');
					list.classList.add('reviewsList');
				for(var i = 0; i<present.length; i++){
						delete present[i].coords;
					var li = document.createElement('li');
					for(var getReviews in present[i]){
						
						if(getReviews == 'date'){
							//alert(new Date(present[i][getReviews]));
							var date = new Date(present[i][getReviews]);
								console.log(getReviews +' = ' + date);
					li.innerHTML += '<p class="date">'+date+'</p>';
						}
						else if(getReviews == 'address'){}
						else{
							console.log(getReviews +' = ' + present[i][getReviews]);
					li.innerHTML += '<p>'+present[i][getReviews]+'</p>';
						}
						
					}
					list.appendChild(li);
				}
								
				var wrapForRev = document.createElement('div');
					wrapForRev.setAttribute('id', 'pres');
				
				wrapForRev.appendChild(list);
				var wrapForRev = wrapForRev.innerHTML;
			}
			
			new Promise(function(resolve, reject){
				console.log(wrapForRev);
				if (!myMap.balloon.isOpen()) {
					myMap.balloon.open(coords,
				
				{contentHeader: gotAddress.properties.get('text')/*+gotAddress.properties.get('name')*/,
                contentBody: '<div style="max-height:150px; overflow-y:auto;">'+wrapForRev+'</div>' +
				    '<p>ОСТАВИТЬ ОТЗЫВ</p>'+'<input id="name1" placeholder="Name"><br><input id="place" placeholder="Place"><br>'+'<textarea id="review" placeholder="review"></textarea>',
                contentFooter:'<button id="send" class="class1">Send</button>'
            });
			}
			else {
				myMap.balloon.close();
			}
				
			document.addEventListener('click',function(e){
				if (e.target.classList.contains('class1')){
				   
				var name2 = name1.value;
				console.log(name2);
				var place1 = place.value;
				console.log(place.value);
				var text = review.value;
				console.log(text);
				
				placeMarkToMap(coords, gotAddress.properties.get('name'), name2, place1, text);
				 myMap.balloon.close();
				 
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
							name: name2,
							place: place1,
							text: text
						}
					}));
					xhr.onload = function(){
						console.log(xhr.response);
					};
				 
				 
				};
	
			});

				resolve();
			})}).then(function(){
				console.log('button', document.getElementsByTagName('button'));
				var button = document.getElementsByTagName('button')
	
			});
			
		});
    });
	

	function placeMarkToMap(coords, address, name, place, text){
		myPlacemark = createPlacemark(coords);
			myPlacemark.properties
                .set({
                    //iconContent: name,
					balloonContentHeader: address +'<br> '+ place,
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
				console.log(address);
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
















