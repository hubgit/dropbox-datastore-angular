var client = new Dropbox.Client({key: 'q6cmfv9xj8wdfxd'});

var ItemsController = function ($scope) {
	$scope.status = 'Loading...';

	/****************
	 * Transformer
	 ****************/

	$scope._proxy = function (item, field){
		return {
			get data() { return item.get(field); },
			set data(val) { item.set(field, val || ''); }
		}
	};

	/****************
	 * Collection
	 ****************/

	$scope.items = [];

	$scope.createItem = function () {
		var item = {
			created: new Date(),
			updated: new Date(),
		};

		angular.forEach($scope.add, function(value, key) {
			item[key] = value;
		});

		$scope.table.insert(item);
		$('#create').modal('hide');
	};

	$scope.updateItem = function () {
		$scope.editingRecord.set('updated', new Date());

		angular.forEach($scope.edit, function(value, key) {
			$scope.editingRecord.set(key, value);
		})

		$('#edit').modal('hide');
	};

	$scope.deleteItem = function (i) {
		$scope.items[i].deleteRecord();
	};

	/****************
	 * Sync
	 ****************/

	$scope.sync = function(event) {
		//console.log(event); // TODO: no event yet
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

	/****************
	 * Forms
	 ****************/

	$scope.creating = function (event) {
		$scope.add = {};
	};

	$scope.editing = function (i) {
		$scope.editingRecord = $scope.items[i];
		$scope.edit = $scope.editingRecord.getFields();
	};

	$(document).on('shown.bs.modal', '.modal', function() {
		$('input[type=text]', this).focus();
	});

	/****************
	 * Authentication
	 ****************/

	$scope.status = 'Authenticating...';
	client.authenticate({ interactive: true }, $scope.authenticated);
};
