// We define an EsConnector module that depends on the elasticsearch module.     
var EsConnector = angular.module('EsConnector', ['elasticsearch']);

// Create the es service from the esFactory
EsConnector.service('es', function (esFactory) {
  return esFactory({ host: '192.168.0.104:9200' });
});

EsConnector.service('filteredListService', function () {
 
    this.paged = function (valLists, pageSize) {
        retVal = [];
        for (var i = 0; i < valLists.length; i++) {
            if (i % pageSize === 0) {
                retVal[Math.floor(i / pageSize)] = [valLists[i]];
            } else {
                retVal[Math.floor(i / pageSize)].push(valLists[i]);
            }
        }
        return retVal;
    };
});




// We define an Angular controller that returns the server health
// Inputs: $scope and the 'es' service

EsConnector.controller('ServerHealthController', function($scope, es) {

    es.cluster.health(function (err, resp) {
        if (err) {
            $scope.data = err.message;
        } else {
            $scope.data = resp;
        }
    });
});


// We define an Angular controller that returns query results,
// Inputs: $scope and the 'es' service

EsConnector.controller('QueryController',function($scope, es, filteredListService) {


	$scope.pageSize = 2;
	$scope.hits = [''];
	$scope.currentPage = 0;
// search for documents
   $scope.search = function(){
			 es.search({
    			index: 'cms',
    			size: 50,
    			body: {
    			"query":
       			 {		
		            "match": {
                            "company_name":$scope.searchTerm
		            }   
        		},
    			}
       
		    }).then(function (response) {
		      $scope.hits = response.hits.hits;
			$scope.pagination($scope.hits);
		    })
	//	$scope.pagination($scope.hits);
	};

 // Calculate Total Number of Pages based on Search Result
    $scope.pagination = function (hits) {
        $scope.ItemsByPage = filteredListService.paged(hits, $scope.pageSize);
    };
 
    $scope.setPage = function () {
        $scope.currentPage = this.n;
    };
 
    $scope.firstPage = function () {
        $scope.currentPage = 0;
    };
 
    $scope.lastPage = function () {
        $scope.currentPage = $scope.ItemsByPage.length - 1;
    };
 
    $scope.range = function (input, total) {
        var ret = [];
        if (!total) {
            total = input;
            input = 0;
        }
        for (var i = input; i < total; i++) {
            if (i != 0 && i != total - 1) {
                ret.push(i);
            }
        }
        return ret;
    };

});

