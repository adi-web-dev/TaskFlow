/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.


// Find a document in a collection.
db.getCollection("workspaces").findOne({

});

db.getCollection("workspaces").find({
    inviteCode: { $exists: false }
}).forEach(function (workspace) {
    db.getCollection("workspaces").updateOne(
        { _id: workspace._id },
        {
            $set: {
                inviteCode:
                    "TF-" +
                    workspace._id
                        .toString()
                        .slice(-8)
                        .toUpperCase()
            }
        }
    );
});
