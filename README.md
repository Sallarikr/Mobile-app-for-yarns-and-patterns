# Yarns & patterns stash

This app was created with `ReactNative` and `React`

The main idea for the app is to work as a stash for craft patterns and yarns. The app uses `Ravelry API` for the data on patterns and yarns. The API is protected with `ravelry.com` authentication, and only Ravelry users who have created a professional account will be able to retrieve the API username and password.

## App design

Upon opening the app, the user is greeted by a `fingerprint scanner` to authenticate the user as the owner of the phone. If the authentication is successful, the app will redirect the user to the starting screen of the app. Navigation happens from tabs at the bottom of the screen.

## Screens

**Home** displays an image welcoming the user to the app.

**Search** allows the user to search for patterns and yarns. The user must choose a category out of those two and insert a search text to an input field. After pressing the search button, the app will display an animation while the search is processing. When the search is done, the app displays the search results inside `Cards` inside a `Scrollview`. The cards display additional information about the search result item.

From book search results the user can add the item to a `favorites list`, which will save the item information to a `Firebase` database.
The same is possible with yarn search results, and in addition the user can add yarns to a `shopping list`, which also saves the item information into Firebase.

The user can clear the search parameters by clicking a button.

**Favorites** screen displays two `Cards`, one for patterns and one for yarns. Upon clicking either one of them, the app opens up a `Modal` displaying the items the user has saved into their favorites. The items are also displayed in cards. The cards have additional `Buttons` that provide deletion of the item or additional information about the item. The additional information opens in a modal.

**Shopping list** uses `Cards `to display the manufacturer and the name of the yarn added to favorites in the `search screen`. From here the user can delete them from the shopping list.

When the user wants to log out of the app, they can press a `log out button` at the top of the app, to be returned to the authentication screen.

