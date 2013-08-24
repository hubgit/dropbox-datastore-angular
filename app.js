var client = new Dropbox.Client({key: 'q6cmfv9xj8wdfxd'});

var ItemsController = function ($scope) {
	$scope.status = 'Loading...';
	$scope.items = [];

	$scope.insert = function () {
		$scope.table.insert({
			created: new Date(),
			title: $scope.title
		});

		$scope.title = null;
	};

	$scope.deleteRecord = function (idx) {
		$scope.items[idx].deleteRecord();
	};

	$scope._item = function (item, field){
		return {
			get model() { return item.get(field); },
			set model(val) { item.set(field, val || ''); }
		}
	};

	$scope.changed = function (event) {
		event.affectedRecordsForTable('items').map(function(record) {
			var found = false;
			var id = record.getId();

			var i = $scope.items.length;
			while (i--) {
				if ($scope.items[i].getId() === id) {
					if (record.isDeleted()) {
						$scope.items.splice(i, 1);
					} else {
						$scope.items[i] = record;
					}

					found = true;
					break;
				}
			}

			if (!found) {
				$scope.items.push(record);
			}
		})
	};

	$scope.sync = function(event) {
		console.log(event); // TODO: no event yet
	};

	$scope.opened = function (error, datastore) {
		if (error) {
			$scope.status = 'Error opening default datastore:' + error;
		} else {
			$scope.table = datastore.getTable('items');
			$scope.items = $scope.table.query();

			$scope.$apply(function() {
				$scope.status = 'Ready';
			});

			datastore.recordsChanged.addListener($scope.changed);
			datastore.syncStatusChanged.addListener($scope.sync);
		}
	};

	$scope.authenticated = function (error, client) {
		if (error) {
			$scope.status = 'Authentication error:' + error;
		} else {
			client.getDatastoreManager().openDefaultDatastore($scope.opened);
		}
	};

	$scope.status = 'Authenticating...';
	client.authenticate({ interactive: true }, $scope.authenticated);
};
