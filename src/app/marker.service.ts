import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

declare let ol: any;

@Injectable({
  providedIn: 'root'
})

export class MarkerService {
  constructor(private httpClient: HttpClient) { }

  countries;
  universities;

  appFunction() {
    // pobranie danych
    this.httpClient.get('https://gist.githubusercontent.com/erdem/8c7d26765831d0f9a8c62f02782ae00d/raw/248037cd701af0a4957cce340dabb0fd04e38f4c/countries.json').subscribe((data) => {
      this.countries = data;

    this.httpClient.get('https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json').subscribe((data) => {
      this.universities = data;

    // filtracja pobranych danych i umieszczenie ich w jednej tablicy
    let list = [];
    let counter;

    for(let i = 0; i < this.countries.length; i++) {
      counter = 0;
      for(let j = 0; j < this.universities.length; j++) {
        if(this.universities[j].country.includes(this.countries[i].name))
          counter++;   
      }
      if(counter != 0)
        list.push(this.countries[i]);
    }

    for(let i = 0; i < list.length; i++) {
      list[i].children = [];
      for(let j = 0; j < this.universities.length; j++) {
        if(this.universities[j].country.includes(list[i].name)) 
          list[i].children.push(this.universities[j]);
      }
    }

    // dodanie mapy
    let map = new ol.Map({
      target: 'map',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        })
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([21, 52.25]),
        zoom: 4
      })
    });

    // dodanie znaczników na mapę
    for(let i = 0; i < list.length; i++) {
      let text = '';
      counter = 1;

      for(let j = 0; j < list[i].children.length; j++) {
        text += counter + '. '+ list[i].children[j].name + '<br/>';
        counter++;
      }

      let markers = new ol.layer.Vector({
        source: new ol.source.Vector({
          features: [
            new ol.Feature({
              geometry: new ol.geom.Point(ol.proj.fromLonLat([list[i].latlng[1], list[i].latlng[0]])),
              name: list[i].name + ', list of universities:' + '<br/>' + '<br/>' + text + '<br/>'
            })
          ]
        }),
        style: new ol.style.Style({
          image: new ol.style.Icon({
            src: 'assets/img/icon.png',
            anchor: [0.5, 1]
          })
        })
      });
      map.addLayer(markers);
    }

    // dodanie okien (popups)
    let container = document.getElementById('popup');
    let closer = document.getElementById('popup-closer');
    let content = document.getElementById('popup-content');
    
    let overlay = new ol.Overlay({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });
    map.addOverlay(overlay);

    closer.onclick = function() {
      overlay.setPosition(undefined);
      closer.blur();
      return false;
    };

    map.on('singleclick', function(event) {
      let name = map.forEachFeatureAtPixel(event.pixel, function(feature) {
        return feature.get('name');
      });
      let coordinate = event.coordinate;
      content.innerHTML = name;
      overlay.setPosition(coordinate);
    });

    map.on('pointermove', function(event) {
      map.getTargetElement().style.cursor = map.hasFeatureAtPixel(event.pixel) ? 'pointer' : '';
    });
  });
  });
  }
}
