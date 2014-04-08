(function(window, document) {

// Create all modules and define dependencies to make sure they exist
// and are loaded in the correct order to satisfy dependency injection
// before all nested files are concatenated by Grunt

// Config
angular.module('siTable.config', [])
    .value('siTable.config', {
        debug: true
    });

// Modules
angular.module('siTable.directives', []);
angular.module('siTable.filters', []);
angular.module('siTable',
    [
        'siTable.config',
        'siTable.directives',
        'siTable.filters',
    ]);
angular.module('siTable.directives').directive('siTable', function($compile) {
    return {
        restrict: 'A',
        scope: true,
        terminal: true,
        transclude: true,
        priority: 1500,
        link: function(scope, element, attrs, controller, transclude) {

            scope.paginationParams = {
                offset: 0,
                limit: 10,
            };

            scope.sortingParams = {};

            transclude(scope, function(clones) {
                element.append(clones);

                if (attrs.pagination) {
                    element.after($compile('<si-table-pagination params="paginationParams"/>')(scope));
                }
            });

            scope.$watch('repeatExpression', function(repeatExpression) {
                var match = repeatExpression.match(/^\s*(.+)\s+in\s+(.*)\s*$/);
                var rhs = match[2];
                items = scope.$eval(rhs);
                scope.paginationParams.total = items.length;
            }, true);

            scope.$watch('sortingParams', function(sortingParams) {
                var sortArray = [];
                for (var key in sortingParams) {
                    if (sortingParams[key] === 'desc') {
                        sortArray.push('-' + key);
                    } else {
                        sortArray.push(key);
                    }
                }
                scope.sortArray = sortArray;
            }, true);
        }
    };
});

angular.module('siTable.directives').directive('tr', function() {
    return {
        restrict: 'E',
        priority: 1001,
        scope: false, // Share scope with siTable
        compile: function(tElement, tAttrs) {

            // Capture ngRepeat expression
            var repeatExpression = tAttrs.ngRepeat;

            // Inject pagination
            tAttrs.ngRepeat += ' | siPagination:paginationParams';

            // Inject sorting
            tAttrs.ngRepeat += ' | orderBy:sortArray';

            if (repeatExpression) {
                return function link(scope, element, attrs) {
                    scope.repeatExpression = repeatExpression;
                };
            }
        }
    };
});

angular.module('siTable.directives').directive('th', function() {
    return {
        restrict: 'E',
        scope: false,
        link: function(scope, element, attrs) {
            element.on('click', function() {
                var sortBy = attrs.sortBy;
                if (!sortBy) {
                    return;
                }
                if (scope.sortingParams[sortBy]) {
                    if (scope.sortingParams[sortBy] === 'asc') {
                        scope.sortingParams[sortBy] = 'desc';
                    } else {
                        delete scope.sortingParams[sortBy];
                    }
                } else {
                    scope.sortingParams[sortBy] = 'asc';
                }
                scope.$apply();
            });

            scope.$watch('sortingParams.' + attrs.sortBy, function(dir) {
                if (dir === 'asc') {
                    element.removeClass('sort-desc');
                    element.addClass('sort-asc');
                } else if (dir === 'desc') {
                    element.addClass('sort-desc');
                    element.removeClass('sort-asc');
                } else {
                    element.removeClass('sort-desc');
                    element.removeClass('sort-asc');
                }
            });
        }
    };
});

// angular.module('siTable.directives').directive('siTable', function($compile) {
//     return {
//         restrict: 'A',
//         scope: true,
//         terminal: true,
//         controller: function($scope, $element, $attrs) {
//             $scope.paginationParams = {
//                 offset: 0,
//                 limit: $attrs.pagination ? parseInt($attrs.pagination, 10) : 10,
//             };
//
//             $scope.sortingParams = [];
//
//             var i, elem;
//
//             // Compile/replace all TR element, to get this scope as their parent
//             // scope so that we can set up watches.
//             var trs = $element.find('tr');
//             for (i = 0; i < trs.length; i++) {
//                 elem = angular.element(trs[i]);
//                 elem.attr('pagination-params', 'paginationParams');
//                 elem.replaceWith($compile(elem)($scope));
//             }
//
//             // Compile/replace all TH elements
//             var ths = $element.find('th');
//             for (i = 0; i < ths.length; i++) {
//                 elem = angular.element(ths[i]);
//                 elem.attr('sorting-params', 'sortingParams');
//                 elem.replaceWith($compile(elem)($scope));
//             }
//         },
//
//         compile: function(tElement, tAttrs) {
//             return function link(scope, element, attrs) {
//                 var items;
//
//                 element.after($compile('<si-table-pagination params="paginationParams"/>')(scope));
//                 scope.$watch('repeatExpression', function(repeatExpression) {
//                     var match = repeatExpression.match(/^\s*(.+)\s+in\s+(.*)\s*$/);
//                     var rhs = match[2];
//                     items = scope.$eval(rhs);
//                     scope.paginationParams.total = items.length;
//                 }, true);
//
//                 scope.$watch('sortingParams', function(sortingParams) {
//                     console.log(sortingParams);
//                 }, true);
//
//             };
//         }
//     };
// });
//
// angular.module('siTable.directives').directive('tr', function() {
//     return {
//         restrict: 'E',
//         priority: 1001,
//         scope: {
//             paginationParams: '=',
//             sortingParams: '='
//         },
//         compile: function(tElement, tAttrs) {
//
//             // Capture ngRepeat expression
//             var repeatExpression = tAttrs.ngRepeat;
//
//             // Inject pagination
//             tAttrs.ngRepeat += ' | siPagination:paginationParams';
//
//             // Inject sorting
//             tAttrs.ngRepeat += ' | orderBy:sortingParams';
//
//             if (repeatExpression) {
//                 return function link(scope, element, attrs) {
//                     scope.$parent.$parent.repeatExpression = repeatExpression;
//                 };
//             }
//         }
//     };
// });
//
// angular.module('siTable.directives').directive('th', function() {
//     return {
//         restrict: 'E',
//         scope: true,
//         // priority: 1041,
//         compile: function(tElement, tAttrs) {
//             var sortBy = tAttrs.sortBy;
//
//             if (sortBy) {
//                 tAttrs.ngClass = '{"bg-danger": true}';
//                 tAttrs.hei = 'hopp';
//
//                 tElement.bind('click', function() {
//                     console.log('click');
//                 });
//
//                 tElement.attr('ngClick', 'sort');
//
//                 console.log(tElement);
//
//                 return function link(scope, element, attrs) {
//
//                     scope.sort = function() {
//                         console.log('sorting by ' + sortBy);
//                     };
//
//                     scope.$parent.sortingParams = [sortBy];
//
//                 };
//             }
//         }
//     };
// });

angular.module('siTable.directives').directive('siTablePagination', function() {
    return {
        restrict: 'E',
        scope: {
            params: '='
        },
        template: '\
            <ul class="pagination">\
                <li ng-class="{disabled: params.offset === 0}">\
                    <a href ng-click="previous()">&laquo;</a>\
                </li>\
                <li ng-repeat="page in showPages" ng-class="{active: currPage === page}">\
                    <a href ng-click="setPage(page)">{{ page }}</a>\
                </li>\
                <li ng-class="{disabled: params.offset + params.limit >= params.total}">\
                    <a href ng-click="next()">&raquo;</a>\
                </li>\
            </ul>',
        link: function(scope, element, attrs) {

            scope.next = function() {
                if (scope.params.offset + scope.params.limit < scope.params.total) {
                    scope.params.offset += scope.params.limit;
                }
            };

            scope.previous = function() {
                if (scope.params.offset > 0) {
                    scope.params.offset -= scope.params.limit;
                }
            };

            scope.setPage = function(page) {
                scope.params.offset = (page - 1) * scope.params.limit;
            };

            scope.$watch('params', function(params) {
                console.log(params);
                var currPage = Math.floor(params.offset / params.limit) + 1;
                var maxPage = Math.floor(params.total / params.limit) + 2;
                var minShowIndex = Math.max(1, currPage - 5);
                var maxShowIndex = Math.min(maxPage, currPage + 5);

                var showPages = [maxShowIndex - minShowIndex];
                for (var i = 0; i < maxShowIndex - minShowIndex; i++) {
                    showPages[i] = minShowIndex + i;
                }

                scope.currPage = currPage;
                scope.showPages = showPages;
            }, true);
        }
    };
});
angular.module('siTable.filters').filter('siPagination', function() {
    return function(input, params) {
        if (!params) {
            return input;
        }
        return input.slice(params.offset, params.offset + params.limit);
    };
});
})(window, document);