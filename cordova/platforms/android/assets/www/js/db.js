var db = new Dexie('messagerie_bdd');

db.version(1).stores({
	contacts: 'id, nom, prenom, email',
	messages: 'id, message, date, sent, contact_id'
});

// Ouverture de la BDD
db.open().catch(function(error) {
	alert('Erreur BDD : ' + error);
});

var DB = {

	// Ajout d'un contact
	ajouterContact: function(contacts){	
		// Pour chaque contact
		$.each(contacts, function(index, contact){
			// Ajout en base
			db.contacts.put({
				id: parseInt(contact.id),
				nom: contact.contact.last_name,
				prenom: contact.contact.first_name,
				email: contact.contact.email
			});
			// Si le contact a envoyé au moins un message		
			if(contact.message != undefined){
				DB.ajouterMessage(contact.message, parseInt(contact.id));
			}
		
		});
		
	},
	
	// Liste des contacts
	listeContacts: function(callback){
		// Si callback est défini = à lui même, sinon fonction ne renvoyant rien
		callback = callback || $.noop;
		// Trié par prénom, puis par nom
		db.contacts
			.orderBy('prenom')
			.sortBy('nom')
			.then(function(contacts){
				// Création d'un tableau pour stocker l'ensemble des contacts
				var _contacts = [];
				// Pour chaque contact
				$.each(contacts, function(index, contact){
					// Récupération du dernier message pour ce contact
					DB.getLastMessage(contact.id, function(message){
						// Message et date du message
						contact.message = message.message;
						contact.date = message.date;
						// Injection dans le tableau _contacts
						_contacts.push(contact);
						// Une fois l'ensemble des contacts parcourus, on peut retourner le tableau en callback
						if(contacts.length == _contacts.length) callback(_contacts);
					});								
				});			
			});
	},
	
	// Ajout d'un message relatif à un contact
	ajouterMessage: function(messages, contact_id){
		
		// Test si "messages" est un tableau
		if( !(messages instanceof Array) ){
			messages = [messages];
		}
		
		// Pour chaque messages
		$.each(messages, function(index, message){
			// Ajout en base
			db.messages.put({
				id: parseInt(message.id),
				message: message.message,
				date: message.date,
				sent: message.sent,
				contact_id: parseInt(contact_id)
			});
		});
		
	},
	
	// Récupération des messages d'un contact
	getMessages: function(contact_id, callback){
		// Si callback est défini = à lui même, sinon fonction ne renvoyant rien
		callback = callback || $.noop;
		// Tri par date
		db.messages
			.where('contact_id')
			.equals(parseInt(contact_id))
			.sortBy('date')
			.then(function(message){
				callback(message);
			});	
	},
	
	// Récupération du dernier message d'un contact
	getLastMessage: function(contact_id, callback){
		// Si callback est défini = à lui même, sinon fonction ne renvoyant rien
		callback = callback || $.noop;
		// "Inversion" de la réponse, et tri par date
		db.messages
			.where('contact_id')
			.equals(contact_id)
			.reverse()
			.sortBy('date')
			.then(function(message){
				// Retour du dernier item
				callback(message[0]);
			});	
	}
}