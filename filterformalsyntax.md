## Formal Syntax for Filters in Plain Text
```
<full-filter> [<full-filter>]+
where
<full-filter> = <sign><filter>
where
<sign> = + | -
<filter> = <type>:<identifier> | prop:<comparison>
where
<type> = tag | color
<identifier> = <tag-name> | <hex-color>
<comparison> = <number-property><numerical-comparison-symbol><signed-number> | <boolean-property>=<boolean> | <string-property><string-comparison-symbol><quoted-string> | <list-property><list-comparison-symbol><list-content>
where
<tag-name> = <single-word-tag-name> | '<multi-word-tag-name>' | "<multi-word-tag-name>"
<hex-color> = #<number-16-lc>{6} | #<number-16-uc>{6}
<list-property> = (a property you've added of the type List)
<list-comparison-symbol> = {} | !{
<list-content> = <quoted-string> | <number> | <boolean>
<boolean-property> = (a property you've added of the type Boolean)
<boolean> = [Tt]rue | [Ff]alse
<string-property> = (a property you've added of the type String)
<string-comparison-symbol> = {} | !{ | = | !=
<quoted-string> = "<string>" | '<string>' | "" | ''
<number-property> = (a property you've added of the type Number)
<numerical-comparison-symbol> = > | < | = | != | <= | >=
<signed-number> = <number> | -<number>
where
<single-word-tag-name> = (the name of any tag in your TagSpace, as long as it has no spaces)
<multi-word-tag-name> = (the name of any tag in your TagSpace, if it has any spaces)
<number-16-lc> = [0123456789abcdef]
<number-16-uc> = [0123456789ABCDEF]
<number> = <whole-number> | <decimal-number>
<string> = <character>[<character>]+
```