﻿(function () {
    'use strict';
    angular.module('atlas2').controller('investigacionCtrl', ['$scope', '$routeParams', '$location', 'investigacionService', 'recursoService', investigacionCtrl]);

    function investigacionCtrl($scope, $routeParams, $location, investigacionService, recursoService) {
        $scope.saving = false;

        $scope.costos = [];
        $scope.capacidades = [];
        $scope.investigaciones = [];

        $scope.recursos = null;
        $scope.recursosCosto = null;
        $scope.recursosCapacidad = null;

        $scope.costo = null;
        $scope.capacidad = null;
        $scope.invetigacion = null;

        var path = $location.path();

        var initialize = function () {
            recursoService.getAll().then(function (data) {
                $scope.recursos = data;
                $scope.recursosCosto = angular.copy($scope.recursos);
                $scope.recursosCapacidad = angular.copy($scope.recursos);
            });

            if (path.indexOf('edit') > -1 || path.indexOf('add') > -1) {
                var id = $routeParams && $routeParams['id'] ? $routeParams['id'] : null
                if (id) {
                    investigacionService.getId(id).then(function (data) {
                        $scope.investigacion = data;
                    });
                }
            } else {
                investigacionService.getAll().then(function (data) {
                    $scope.investigaciones = data;
                });
            }
        }

        $scope.add = function () {
            $scope.saving       = true;
            var investigacion   = this.investigacion;
            
            investigacion['costos'] = $scope.costos;
            investigacion['capacidad'] = $scope.capacidades;

            investigacionService.add(investigacion).then(
                function (data) {
                    $scope.investigaciones.push(data);
                    $scope.saving = false;

                    mostrarNotificacion('success');
                    window.history.back();
                }, function () {
                    $scope.saving = false;

                    mostrarNotificacion('error');
                }
            );
        }

        $scope.edit = function () {
            $scope.saving = true;
            var investigacion = this.investigacion;

            investigacionService.edit(investigacion).then(
                function (data) {
                    $scope.saving = false;

                    mostrarNotificacion('success');
                    window.history.back();
                }, function () {
                    $scope.saving = false;

                    mostrarNotificacion('error');
                }
            );
        }

        $scope.borrar = function (index) {
            $scope.saving = true;
            var investigacion = this.investigacion;

            var r = confirm("Seguro que quiere borrar?");
            if (r == true) {
                investigacionService.borrar(investigacion.id).then(
                 function () {
                     $scope.investigaciones.splice(index, 1);
                     $scope.saving = false;

                     mostrarNotificacion('success');
                 }, function () {
                     $scope.saving = false;

                     mostrarNotificacion('error');
                 }
             );
            }
        }

        var mostrarNotificacion = function (tipo) {
            var title = '';
            var text = '';

            if (tipo == 'success') {
                var title = 'Exito!';
                var text = 'Acción realizada con exito.';
            } else if (tipo == 'error') {
                var title = 'Oh No!';
                var text = 'Ha ocurrido un error.';
            }

            new PNotify({
                title: title,
                text: text,
                type: tipo,
                nonblock: {
                    nonblock: true
                }
            });
        }

        $scope.addRelation = function (type) {
            var scopeData = null;
            var items = null;
            var item = null;

            if (type == 'costo') {
                scopeData = $scope.recursosCosto;
                items = $scope.costos;
                item = this.costo;
            } else if (type == 'capacidad') {
                scopeData = $scope.recursosCapacidad;
                items = $scope.capacidades;
                item = this.capacidad;
            } else {
                return console.error('No se encontro el tipo de relacion.');
            }

            if (!item) {
                return console.error('No agrego ninguna relacion.');
            }

            for (var rec in scopeData) {
                var data = scopeData[rec];
                if (parseInt(item.recurso) == data.id) {
                    var dataGuardar = {
                        valor: item.valor,
                        recurso: item.recurso,
                        nombreRecurso: data.nombre,
                        incrementoNivel: item.incrementoNivel
                    }

                    items.push(dataGuardar);
                    scopeData.splice(rec, 1);

                    item.valor = null;
                    item.recurso = null;
                    item.incrementoNivel = null;
                    return;
                }
            }
        }

        $scope.removeRelation = function (type, index) {
            var scopeData = null;
            var items = null;
            var item = null;

            if (type == 'costo') {
                scopeData = $scope.recursosCosto;
                items = $scope.costos;
                item = $scope.costos[index];
            } else if (type == 'capacidad') {
                scopeData = $scope.recursosCapacidad;
                items = $scope.capacidades;
                item = $scope.capacidades[index];
            } else {
                return console.error('No se encontro el tipo de relacion.');
            }

            for (var rec in $scope.recursos) {
                var recurso = $scope.recursos[rec];

                if (parseInt(item.recurso) == recurso.id) {
                    scopeData.push(recurso);
                    items.splice(index, 1);
                    return;
                }
            }
        }

        initialize();

    }

})();