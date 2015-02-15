Advanced Sharer for diaspora*
=========================

Advanced Sharer is a tool able to share links to any 
[diaspora*](http://github.com/diaspora/diaspora) pod. 
[Learn more](http://sharetodiaspora.github.io/about).

## Usage
The same parameters from diaspora* bookmarklets for title, 
URL and notes can be used, just add them to the URL:

```
http://sharetodiaspora.github.io/?url=diasporafoundation.org&title=The%20diaspora*%20Project&notes=Welcome%20to%20diaspora*
```

[Try it!](http://sharetodiaspora.github.io/?url=diasporafoundation.org&title=The%20diaspora*%20Project&notes=Welcome%20to%20diaspora*)

You can use [sharing buttons and a custom bookmarklet](http://sharetodiaspora.github.io/about) 
to create these links. There's also a [Firefox extension](https://github.com/jaywink/diaspora-advanced-sharer)
and a [Wordpress plugin](https://github.com/ciubotaru/share-on-diaspora/).

If you want a button with a simpler UI, you may want to 
check out this [simple sharing button](https://github.com/sebastienadam/simple_diaspora_sharing_button).
There are other options available in [the diaspora* wiki](https://wiki.diasporafoundation.org/Tools_to_use_with_Diaspora)
as well.

**Note**: If you've marked *Remember my choice* then you 
will be always redirected to the pod you chose that time. 
To avoid this, add the parameter `&redirect=false` on the URL.

## Contributing
Any fixes and improvements are greatly appreciated. Feel 
free to [fork the project](https://github.com/sharetodiaspora/sharetodiaspora.github.com/fork)
and tinker with it :)

### Translations
We're currently using [L20n](https://github.com/l20n/l20n.js) 
by Mozilla for localization. To contribute a translation the 
*Github way*, you can fork this project and add a locale folder 
for your language under `locales`. Copy the file `index.l20n` 
from another locale and use it to translate to your language. 
Then create a pull request to send them to the original repo.
