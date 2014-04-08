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
        controller: function($scope, $element, $attrs, $transclude) {
            $scope.paginationParams = {
                offset: 0,
                limit: 10,
            };

            $scope.sortingParams = {};

            $attrs.$observe('pagination', function(pagination) {
                $scope.paginationParams.limit = parseInt(pagination, 10);
            });

            $scope.$watch('repeatExpression', function(repeatExpression) {
                var match = repeatExpression.match(/^\s*(.+)\s+in\s+(.*)\s*$/);
                var rhs = match[2];
                items = $scope.$eval(rhs);
                $scope.paginationParams.total = items.length;
            }, true);

            $scope.$watch('sortingParams', function(sortingParams) {
                var sortArray = [];
                for (var key in sortingParams) {
                    if (sortingParams[key] === 'desc') {
                        sortArray.push('-' + key);
                    } else {
                        sortArray.push(key);
                    }
                }
                $scope.sortArray = sortArray;
            }, true);
        },
        link: function(scope, element, attrs, controller, transclude) {
            transclude(scope, function(clones) {
                element.append(clones);

                if (attrs.pagination) {
                    element.after($compile('<si-table-pagination params="paginationParams"/>')(scope));
                }
            });
        }
    };
});

angular.module('siTable.directives').directive('tr', function() {
    return {
        restrict: 'E',
        priority: 1001,
        require: '?^siTable',
        scope: false, // Share scope with siTable
        compile: function(tElement, tAttrs) {

            // Capture ngRepeat expression
            var repeatExpression = tAttrs.ngRepeat;

            // Inject sorting
            tAttrs.ngRepeat += ' | orderBy:sortArray';

            // Inject pagination
            tAttrs.ngRepeat += ' | siPagination:paginationParams';

            if (repeatExpression) {
                return function link(scope, element, attrs, controller) {

                    // Do as little damage as possible if this `TR` is not part
                    // of an siTable
                    if (!controller) {
                        return;
                    }

                    // Let the siTable controller know what's being repeated
                    scope.repeatExpression = repeatExpression;

                };
            }
        }
    };
});

angular.module('siTable.directives').directive('th', function() {
    return {
        restrict: 'E',
        require: '?^siTable',
        scope: false,
        link: function(scope, element, attrs, controller) {

            // Do as little damage as possible if this `TH` is not part of an
            // siTable
            if (!controller) {
                return;
            }

            // Tri-state toggle sorting parameter
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

            // Add classes to the `TH` according to its state
            scope.$watch(function() {
                if (!scope.sortingParams || !attrs.sortBy) {
                    return;
                }
                return scope.sortingParams[attrs.sortBy];
            }, function(dir) {
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