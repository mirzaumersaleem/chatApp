const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(3001).sockets;

// Connect to mongo
mongo.connect('mongodb://mirza:nyQzoq-vusto1-bohvup@cluster0-shard-00-00-kpjoe.mongodb.net:27017,cluster0-shard-00-01-kpjoe.mongodb.net:27017,cluster0-shard-00-02-kpjoe.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority', function(err, db){
    if(err){
        throw err;
    }

    console.log('MongoDB connected...');

    // Connect to Socket.io
    client.on('connection', function(socket){
        let chat = db.collection('chats');

        console.log('Client joined with id ',socket.id);

        // Create function to send status
        sendStatus = function(s){
            socket.emit('status', s);
        };

        // Get chats from mongo collection
        chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
            if(err){
                throw err;
            }

            // Emit all the messages
            socket.emit('messages', res);
        });

        // Handle input events
        socket.on('input', function(data){
            let name = data.name;
            let message = data.message;

            // Check for name and message
            if(name == '' || message == ''){
                // Send error status
                sendStatus('Please enter a name and message');
            } else {
                // Insert message
                chat.insertOne({name: name, message: message}, function(err, res1){
                    client.emit('output', res1.ops[0]);

                    // Send status object
                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                });
            }
        });

        // Handle clear
        socket.on('clear', function(){
            // Remove all chats from collection
            chat.deleteMany({}, function(){
                // Emit cleared
                client.emit('cleared');
            });
        });
    });
});