var config = {
	database: {
      local: {
        host     : '127.0.0.1',
				// host     : '10.250.114.10',
        user     : 'hrdemo',
        password : '7890',
        database : 'hrdemo',
				// database : 'hrdp',
        multipleStatements: true
      },
      development: {
        host     : '10.250.114.10',
    		user     : 'hrdemo',
    		password : '7890',
    		database : 'hrdp',
    		multipleStatements: true
      }
	}
};

module.exports = config;
