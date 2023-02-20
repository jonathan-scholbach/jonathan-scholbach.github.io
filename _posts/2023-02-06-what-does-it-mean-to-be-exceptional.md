---
title: What Does It Mean to Be Exceptional
title_ending: "?"
subtitle: How to Handle Exceptions [in Python]
tags: [Conceptual Code, Exception Handling, Technical Debt, Python]
layout: post
toc: true
---

<div class="flowers">
🌼🌼🌼🌻🌼
</div>

What does it mean to be exceptional? --- This question is important not only to
artists and teenagers, but also to software developers. Similar as it structures
a society, it touches the problem how we should organize our code. And the
answer for developers is the same it has been for generations of teenagers
striving to be cool: what is "normal" and what is "deviant" cannot be decided
without context, but it depends on the constitution of the surroundings.

As authors of code, we are the ones defining its constitution. By using
exceptions, we create a _hierarchy_. By considering (or even marking) something
as exceptional, we assign it a certain _status_. In our code, we should organize
status so that it helps our readers understand our code:[^hierarchy] If our
computer program was a painting, what would we want to be the foreground in that
painting, and what do we want the spectator to consider background? Exceptions
provide an opportunity to structure the perception of our reader, and guide their
attention.

[^hierarchy]:
    Luckily, the organization of computer code differs from the organization of
    society in the aspect that the definition of norm and deviance does not do
    any harm to anyone.

This article discusses different strategies of working with exceptions. The main
story is about Python, but basic insights can be applied to other programming
languages as well.


# 1. Exceptions in Different Languages

In the trade-off between development speed and code robustness, Python often
gives us the freedom to write fragile code. One example for this is the absence
of strict typing and Python's duck typing approach. Another example is how we
can steer the control flow of a Python program with exceptions: In Python, it
is possible to throw an exception using the `raise` keyword, which, if not
caught in a `try`-`except` block, will make the program crash.

The absence of a safeguarding mechanism forcing the developer to ensure that
thrown exceptions are actually caught makes for quick prototyping. It also
introduces fragility. While development speed is nice, fragility is technical
debt and can become a pain quickly.

Other programming languages (including some well-known for developer
satisfaction such as Rust, or Elixir) favor a more robust approach. Instead of
using a mechanism that can potentially make the whole program crash, they use
return values for signalling exceptional behavior.

For instance, in Rust, functions may return a `Result`, which can be either an
instance of `Ok` or `Err`. When working with an instance of `Result`, we can
call its `unwrap()` method, which will either return the wrapped value or raise
the exception. That way, whenever we call the `unwrap()` method, Rust forces us
to make a distinct decision that we are willing to have our program crash at
this point -- or handle the exception in a way that prevents our program from
panicking.

Similarly, in Elixir, it is a convention to return a pair, containing either an
`:ok` or `:error` atom in the first slot, and the actual return value in the
second slot of the pair. Elixir's way of defining function signatures with
pattern matching shines at making the control flow very tangible: the _happy
path_ and the _error path_ can actually be expressed as different paths in the
code. This allows for rather complex error paths without loosing track of what
is going on:

{% highlight Elixir %}
def to_age(value) when is_binary(value) do
  # Transforming string to integer here and pass result to integer handling
  # branch of `to_age`
  case Integer.parse(value) do
    {:ok, integer} -> to_age(integer_value),
    {:error, _ } -> {:error, "Age string must hold an integer number"},
  end
end

def to_age(value) when is_integer(value) and value < 0 do
  { :error, "Come on, your age cannot be negative!" }
end

def to_age(value) when is_integer(value) and value > 122 do
  {
    :error,
    "Jeanne Calment, the oldest person ever,"
    <> "got 122. Are you sure you are older?"
  }
end

def to_age(value) when is_integer(value) do
  # this matches only if none of the exceptional scenarios above has matched.
  # Hence, we can be sure to have a valid integer at this point
  {:ok, Age(value)}
end

def to_age(value) do
  { :error, "Age value must be a binary string or an integer" }
end
{% endhighlight %}
*__An example of using pattern matching on the function signature to handle
different exceptional cases, in Elixir: `to_age` handles both integers and
strings that either contain an integer (ok) or not (error). In both cases the
integer is checked for being positive and not bigger than some maximum value.__*

Just for comparison, this is a way the same could be achieved in Python, raising
a `ValueError` whenever some validation fails:

{% highlight Python %}
def to_age(value: int | str) -> Age:
    if isinstance(value, str):
        try:
            value = int(value)
        except ValueError:
            raise ValueError("Age string must hold an integer number")

    if not isinstance(value, int):
        raise ValueError("Age value must be a string or integer")

    if value < 0:
        raise ValueError("Come on, your age cannot be negative!")

    if value > 122:
        raise ValueError(
            "Jeanne Calment, the oldest person ever,"
            "got 122. Are you sure you are older?"
        )
    return Age(value)
{% endhighlight %}

In other strongly typed languages, for instance Java, it is possible to throw
exceptions, but the developer has to declare all the possible exceptions a
function could throw in the function signature.


# 2. Micro- vs Macro-Structure

When we look at the micro-structure of our code, when we are inspecting
functions in isolation, raising an exception totally makes sense: In the example
above, raising a `ValueError` is a good indication of what is going on. The
semantics of the exception express the _intent_ of the code very directly. And
that is always a good thing.

Problems can emerge at the macro-structure level of our code. How do functions
which potentially raise integrate smoothly with the context of the whole program?
What do their callers (and the callers of their callers) have to know in order
to work with them safely? How does the caller know that `to_age` might raise a
`ValueError`?

How can life be made easy for the caller? In later examples, we will see that
there are problems lurking when we make our code throw exceptions. These
problems are the reasoning of those programming languages which prefer to signal
exceptional scenarios in the return value of the function instead of making the
function throw an exception.

As other languages do it differently, why does Python allow to raise, in the
first place? Similar to the value a certain function returns, an exception is
some sort of a "response" of that function. Next to the parameters it accepts,
and the values it returns, the possible exceptions a function might raise are an
essential part of the function's interface. And "the function's interface" is
just a different name for "what matters for the caller of the function". The
interface of a method is what matters when we think about the macro-structure of
our code.

But other than the parameter specs or the return type, exception specifications
are not part of the function's signature or type annotation in Python.[^guido]
When we want to be on the safe side when writing a caller for a function,
neither the compiler nor the type checker can provide us any help: We have to
inspect the body of the function in order to be sure that we cover the full
spectrum of possibilities when handling the "response" of the function. And it
is not even enough to check the body of the function -- in order to be safe our
code does not accidentally crash, we even have to check the function bodies of
the functions that are being called by the function we are calling, and so on.
This can cause trouble.

[^guido]:
    And Guido van Rossum, the creator of Python, [has expressed strong
    opposition against including exception annotations in Python's type hinting
    system](https://github.com/python/typing/issues/71), making it very unlikely
    that we are going to see this becoming a feature in Python in the sooner
    future. This is a distinctive design decision, which makes a significant
    difference between Java (where raised exceptions are part of the mandatory
    type signature of a method) and Python when it comes to the meaning of
    exceptions.


# 3. Difference between Returning and Raising

From this point of view, raising an exception merely appears as some sort of
creating an "unofficial" response, a response off the books. But is there
another, more fundamental difference between raising and returning? What is the
_essential difference_ between returning and raising?

Well, there is none, really. Have a look at the following code snippet:


{% highlight Python %}
from typing import NoReturn


class ResultDisguisedAsException(Exception):
    def __init__(self, value: Any) -> None:
        self.value = value


def function(value: int) -> NoReturn:
    # ... (apply some operations to value here)
    raise ResultBeingRaised(value)


def caller():
    try:
        function(1)
    except ResultDisguisedAsException as result:
        # ... (do something with result.value here)
{% endhighlight %}
*__A way to replace return statements by raise statements, demonstrating that
there is no essential difference between raising and returning.__*

In this snippet, `function` basically responds by raising an exception instead
of returning a value. `caller` does not use the returned value (`function`
does never return, actually), but inspects the exception in order to get the
what would be the return value in a normal program flow. This code snippet is
somewhere between academic and ridiculous, of course. But it demonstrates that
there is no _essential_ difference between raising and returning: Logically, any
Python program using methods with `return` statements, could  be rewritten using
`raise` statements exclusively.

That shows that the difference between raising and returning is _arbitrary_,
i.e. it is a matter of a willful decision -- a matter of a willful decision of
_ours_, to be precise. For understanding the difference between raising and
returning, we cannot rely on trying to understand the _essence_ of these terms,
as _essentially_, they are not different. Asking "What are the essential
characteristics of an exception?" is a little like asking "What are the
essential characteristics of a gift?" -- Anything can be a gift. Whether a
certain object is a gift or not, cannot be found in the specifics of that
object, it can only be found in the way that object is being used. And the same
holds true for exceptional scenarios in Python code.


# 4. Structuring Code into Background and Foreground

We cannot _understand_, we have to _decide_ what we want to consider an
exception and what not; or, to express this in a better way: By returning or
raising, we structure our code in a certain way, sending the signal to the
reader of our code: This is a matter of differentiating between RELEVANT and
IRRELEVANT.[^lakoff]

[^lakoff]:
    If you wonder why I write these terms in uppercase: It is because I consider
    them _conceptual metaphors_. The notion of conceptual metaphors (and the
    convention to write them in uppercase) I have taken from the book _Metaphors
    We Live By_ by Lakoff and Johnson. It is a great read for understanding more
    about human cognition and language. As writing good code means writing code
    that can easily be digested by human cognition, I draw a lot from it when
    writing code.

This is a matter of perception in general, and there is an abundance of
examples for how differentiating between FOREGROUND and BACKGROUND shapes
how we perceive and understand information. Just one example for this, from
outside the coding world, is the way footnotes are being used in books: They
manage to provide some extra information, while keeping the reader's attention
to the main story. And, more than that, they give a clear signal, what is the
important, the CORE information, and what is EXTRA.

![foreground-background.jpg](/assets/what-does-it-mean-to-be-exceptional/foreground-background-illusion.svg){:width="60%"}
*__Sometimes it is hard to grasp what is foreground, what is background. What is
relevant, what is irrelevant? This confusion is mentally stressful.__*

Another example, from coding software, is the paradigm of [early
returning](https://medium.com/swlh/return-early-pattern-3d18a41bba8): By
separating the validation logic from the business logic the reader can focus on
the latter. As soon as the validation is over, the reader can forget about it.
It has become IRRELEVANT. The reader only has to keep an active representation
of the FOREGROUND information in their current mental state which is stripped
off BACKGROUND noise. Sending these signals that help the readers differentiate
between FOREGROUND and BACKGROUND is a way to prevent them from feeling
overwhelmed.

The same principle applies for `raise` vs `return`: Whatever is returned is
marked as FOREGROUND, as the mainstream of our program flow. Exceptions are
pushed to the mental BACKGROUND.


# 5. Exception Handling Paradigms

In order to discuss different strategies that we can apply, let's have a look at
very common architecture with an entry point, a layer which performs some sort
of validation (let's say "controller layer"), a layer for the business logic
(say: "service layer"), and a "persistence layer" (sometimes called "repository
layer") which handles reading and writing of data, abstracting away the
specifics of the data storage:

![layered architecture](/assets/what-does-it-mean-to-be-exceptional/layered-architecture.svg)
*__Abstract Minimal Structure of a Layered Architecture.__*

Consider, for instance, a GET endpoint in a REST API, which is requesting a
single movie from our database, based on some filter criteria (such as title,
language, director, or starring actresses and actors, and so on).

The real life example could of course be more complex. We are focussing on the
elements that are relevant to demonstrate the up- and downsides of different
exception handling strategies here.


## 5.1 Bubbling Up

One strategy of handling exceptions is to have them "bubble up". The metaphor
involves that the outer layers are on the TOP, and the inner layers are on
the BOTTOM. Any exception raised on a lower level is not handled directly on the
next level, but only at the very top layer. That way intermediate layers can
simply ignore exceptions on lower layers, taking some complexity off their
shoulders:

![bubbling-up](/assets/what-does-it-mean-to-be-exceptional/bubbling-up.svg)
*__Having Exceptions bubble up means not handling them in intermediate layers.__*

In a rough code sketch, this would look like this:

{% highlight Python %}
class NotFound(Exception):
    pass


def load_movie_by_filters(filters) -> Movie:
    # Skipping db implementation part of this layer
    matches: list[Movie] = MovieDatabase.filter(filters)
    if not matches:
        raise NotFound()
    return matches[0]


def movie_filter_service(filters) -> Movie:
    # Skipping business logic part of this layer
    return load_movie_by_filters(filters)


def movie_filter_controller(filters) -> Movie:
    # Skipping validation logic part of this layer
    return movie_filter_service(filters)


def entry_point(filters):
    try:
       return movie_filter_controller(filters)
    except NotFound:
       print("Movie could not be found")
{% endhighlight %}
*__Minimal Code Example For a Layered Architecture with Exceptions Bubbling Up.
The example code is not meant to serve as a real-world example. It should only
provide some orientation about the code structure we are talking about.__*

The snippet demonstrates, how the intermediate layers do not care about the
exception at all. The exception is passed upwards without the intermediate
layers even taking notice, "behind their back".

A prominent example following this approach, is the
[fastapi](https://fastapi.tiangolo.com/){:target="\_blank"} web framework. It
has a particular exception class `HTTPException`. In handling an HTTP request,
whenever the downstream code raises this exception, the router turns this
into the appropriate HTML error response. fastapi is created for developing
HTTP APIs quickly, and this feature helps: In whatever layer of our code -- when
fetching data from the database, when reading configuration, when validating
input data, you name it -- we can simply raise an `HTTPException` with the
appropriate HTTP error code. We do not need to handle those anywhere.
Ultimately, the framework takes care of it.

In order to make this approach work, our repository method has to raise some
sort of exception indicating that the movie could not be found. This makes
perfect sense in the scope of the simple example: It does a very good job at
highlighting the FOREGROUND of the application logic -- finding a movie --, and
muting the exceptional cases, moving them into the conceptual BACKGROUND. The
readers of an application following that approach can always safely forget about
the exception handling. They don't have to trace the exception path, because
they know that, eventually, the exception is being turned into a corresponding
error response. That is a great deal of mental relief!

There is a downside, though: This approach comes with coupling the repository
implementation to the business logic. The repository itself has to know that not
finding a movie is supposed to eventually lead to an error response. The decision
about what severeness the absence of a movie is assigned to (whether it should
be treated as an error or not, and if it is considered an error, _which kind of
error_ it is supposed to be) is happening at the innermost layers.[^fastapi] And
this is usually not a good place to make that decision.

[^fastapi]:
    Raising the exception could, of course be postponed. Or intermediate layers
    could catch the exception. But both would mean we are leaving the paradigm
    of bubbling up.

Let's have a closer look at the case of a missing movie in our database. From
the perspective of a repository, is that really something we should consider an
exceptional case? From the micro-structure perspective, we would actually say
no: It should be perfectly expected that the repository does not hold all the
movies that are out there. Hence, a request against our data which does not
match a movie in our database should not be unexpected at all. It does not
necessarily indicate that anything in the request is _wrong_, if our database
does not hold a matching movie.

That means, we might have paths in our application, where we want to use the
repository method, but do not want to treat a missing movie as an error. If that
is the case, we would find ourselves implementing a structure to handle the
exception in the intermediate layers based on context -- which would break the
beautiful simplicity of the bubbling-up approach and may make things messy
quickly.

That emphasizes the fact that our implementation of the repository has to be
understood _in the context_ of the rest of our program. And that is an
indication of a lack of decoupling.


## 5.2 Shadow Control Flow

If our code logic is very simple, it might be a good advice to leverage the
benefits of the bubbling up approach. But it can get messy:

Imagine a scenario where we need to implement a different service, which needs
to actually change its control flow based on whether a movie entry has been
found. Suddenly, our convenient paradigm of "service layer methods don't care
about exceptions from the persistence layer" would be broken. Or, consider
another scenario, where two different controllers end up using the same
repository, but they need to send different errors in case of the absence of
data. Consider, for instance, a scenario where not finding a user in the
database is supposed to lead to an `401 Unauthorized` instead of a `404 NotFound`.

In these scenarios, the controllers would have to _interpret_ the `NotFound`
exception coming from the repository. But what if a controller is relying on
multiple repositories? Then this interpretation logic becomes really cumbersome.
Imagine the nasty logic a controller would need to interpret the error based on
the context it was raised in. That is messy.

![Introducing a shadow control flow where services sometimes handle exceptions,
sometimes not, is
messy](/assets/what-does-it-mean-to-be-exceptional/shadow-control-flow.svg)
*__In a shadow control flow, exceptions are handled on a case-to-case basis. It
quickly gets messy and hard to trace.__*

That is how the bubbling up strategy is at risk of deteriorating into a "shadow
control flow". It is "in the shadow", because it is a second control flow which
is not expressed in the regular control flow established by calling and
returning, but is working "behind the scenes".

The underlying problem is the coupling of the repository layer
with the controller layer.


## 5.3 Watertight Exception Handling

In order to avoid ending up with a spaghetti logic for handling exceptions in a
shadow control flow, it makes sense to apply a more tightly supervised approach.
Bringing order into the chaos of a shadow control flow, we could either never
raise any exceptions at all, or we could give the caller the responsibility to
catch all exceptions raised by the called function and handle. The obvious
advantage of this approach is that it is dead simple. The downside is that with
this approach, we have to write more lines of code. This is basically the
trade-off between being more explicit or being more concise.

Both approaches, explicitly handling all exceptions, and not raising any
exceptions, have very similar effects in helping the reader grasp the
macro-structure of our code.

But there is one difference, and this is specific to Python and its typing
system: the exceptions that are potentially being raised of a function are not
part of the type specification of this function. That means that whenever we
call a function, we would have to check whether it does have a raising scenario.
That is why it is advisable to follow the approach of never raising an
exception. That way we can leverage the benefits of Python's type hinting system
in order to fully specify the interface of our methods, including the
exceptional paths.

Hence, let's have a look at how a paradigm of indicating exceptional behavior
through the return value of the function instead of through raising an expression
can be applied:


# 6. Returning Instead of Raising

## 6.1 Meaningful Return Values

Very often, meaningful return values can be used to signal exceptional behavior.
Most often, returning `None` is a good indication: Whenever a function is
supposed to calculate a result, or retrieve a value, `None` may indicate
exceptional program flow.

{% highlight Python %}
def age_from_years(years: int) -> Age | None:
    if years < 0:
        return None
    return Age(years)
{% endhighlight %}
*__This code example uses a return value of None to indicate that "something
went wrong" when trying to create an instance of Age.__*


Sometimes, we can also use the semantics of a return value in order to indicate
an edge case. An example for this is the behavior of
`Array.prototoype().indexOf` in JavaScript: If `someArrray` does not contain
`value`, `someArray.indexOf(value)` will be  `-1`. In JavaScript, array indexes
can only be positive, so returning a negative index uses that deviation from the
semantics in order to signal the occurrence of an edge case.[^negative_index]

[^negative_index]:
    Python uses negative indexes to indicate that the index is counted from the
    end, so using this signal in Python would not exactly express the same
    meaning as in JavaScript.

A lot of scenarios can be covered by exploiting the semantics of the return value.


## 6.2 Returning an Exception

But sometimes there are scenarios, where a meaningful return value is not
enough.

For instance, the above example from JavaScript returning `-1` as the index for
an absent value is not super clear. For anybody who is not familiar with it
already, it would involve some guesswork to understand it. Also, and this is
more important, the _type_ of the returned value is still an integer, so there
is not type difference between the normal path and the exceptional path. The
consumer has to _know_ that `-1` is the signal for an exception. And this is
similar to the situation where the consumer has to know which exceptions are
raised: The type annotation of the return value in the function signature does
not reveal the error-signal properly, so the caller might miss to handle the
exception case properly. For a well-established function from the standard
library, that might be acceptable. But for a lesser-known function our future
selves have to consume this might be a surprise.

Potentially returning `None` is usually a clearer signal. A function potentially
returning `None` exposes the exceptional flow nicely in the type definition of the
return value. Not handling the edge case will make the type checker warn us:

{% highlight Python %}
def position(string: str, char: str) -> int | None: try:
    return string.index(char) except ValueError: return None

# typechecker won't accept this:
x: int = position("abc", "d")
{% endhighlight %}

But still, sometimes we need more: Sometimes, we want to express not just that
"something went wrong", but we also want to be able to differentiate between
different kinds of exceptional scenarios. Just returning `None` would deprive
the caller from the possibility to handle the two different cases in different
ways.

Another use case is that `None` is actually a valid value of the function.

In those cases, a very clean approach is to create an exception, but to return
it instead of raising it:

{% highlight Python %}
class NegativeAge(ValueError):
    pass


class IncredibleAge(ValueError):
    pass


def age_from_years(
    years: int,
) -> Age | NegativeAgeException | IncredibleAgeException:
    if years < 0:
        return NegativeAgeException(years)
    if years > 122:
        return IncredibleAgeException(years)

    return Age(years)
{% endhighlight %}
*__An example of returning different exceptions for different scenarios. The
different scenarios are nicely expressed in the function's type signature.__*

This is a way of making the exception handling more robust. Now the possible
exceptions are part of the type annotation of a function. This makes the control
flow much more explicit, and it leverages the power of our type checker: Now,
the type checker will warn us if we forgot to handle an exceptional path. If,
for some reason, we want our program to actually panic with the correct
exception, the caller can still decide to raise the exception, making use of the
trace of the exception.


## 6.3 Result Wrapper

The interface of `age_from_years` in the example above is very explicit about
the potential edge cases. But it fails to differentiate the exceptional flow from
the normal program flow.

In order to highlight the conceptual FOREGROUND better from the conceptual
BACKGROUND, it makes sense to adopt the behavior of languages such as Rust,
Elixir, and Go: We can use a wrapper class to indicate the result or success in
the function signature. This does a better job at indicating what is the normal
flow.

The following code snippet is a sketch of an implementation of this approach in
Python. Effectively, this opens the door of using the type checker to ensure that
all exceptions are handled.

{% highlight Python %}
from typing import Generic, NoReturn, TypeVar

OkType = TypeVar("OkType")
ErrType = TypeVar("ErrType", bound=Exception)

class Ok(Generic[OkType]):
    def __init__(self, value: OkType) -> None:
        self._value: OkType = value

    def unwrap(self) -> OkType:
        return self._value

class Err(Generic[ErrType]):
    def __init__(self, error: ErrType) -> None:
        self._error = error

    def unwrap(self) -> NoReturn:
        raise self._error

Result = Ok[OkType] | Err[ErrType]
{% endhighlight %}
*__A rough code sketch how to implement a Rust-like Result Wrapper__*

Here is an example of how to use it:

{% highlight Python %}
from sys import exc_info


class AgeOutOfRange(ValueError):
    pass


class InvalidInput(ValueError):
    pass


def to_age(value: str | int,) -> Result[Age, AgeOutOfRange | InvalidInput]:
    try:
        return int(value)
    except ValueError:
        traceback = exc_info()[2]
        return Err(
            InvalidInput("Age string must hold a number")
            .with_traceback(traceback)
        )

    if value < 0:
        return Err(AgeOutOfRange(
            "Come on, you can't have negative age.",
        ))

    if value > 122:
        return Err(AgeOutOfRange(
            "Jeanne Calment, the oldest person ever,"
            "got 122. Are you sure you are older?"
        ))

    return Ok(Age(value))
{% endhighlight %}

If you are interested in using the approach of a `Result` wrapper, I recommend
looking into the
[poltergeist](https://github.com/alexandermalyga/poltergeist){:target="\_blank"}
library written by Alexander Malyga. While the code snippet above is not more
than a rough sketch, that library is more mature, and has some features which
make adopting this paradigm more convenient.[^malyga]

[^malyga]:
    I stumbled across it, when the author, Alexander commented to an answer of
    mine on a quite old question on [Stack
    Overflow](https://stackoverflow.com/a/74192977/3566606). The library is
    still work in progress. If you find the overall approach interesting, it
    might make sense to help build additional features.


# 7. Shades of Grey: How to Trade-Off

So far, we have seen different approaches. It is quite clear that we will want
to avoid creating a shadow control flow. But for the other approaches, there
does not seem to be an argument saying "never use this" or "always use that". As
often in life, many ways are possible.

In a pragmatic world, where writing software is always a matter of trade-offs,
we should see different approaches as an amplification of our repertoire to opt
for the necessary amount of robustness that our codebase needs. Just because we
write Python, it does not mean, our code has to be fragile. 😉 Python allows,
but does not force us to create a shadow control flow of exceptions.

Python is a simple programming language. That is why it is, next to JavaScript,
one of the programming languages many developers start coding with. Not having
to deal with type hinting and exception handling is definitely a way to keep the
entrance barrier into the language (and into programming in general) low. And
that is a good thing. If we train a junior programmer or a non-programmer, maybe
it is OK to have them work on tasks which are fairly simple, and which do not
require that level of robustness.

The more mature our trainee gets as a software developer, the more we will
want them to be able to handle complex code bases. Those demand stronger
robustness of code, because pain gets unbearable otherwise.

Next to developer maturity, code maturity is a factor to consider, too: In an
agile environment with rapid prototyping and a relevant level of future
uncertainty, first versions do not have to be perfect. Their functionality is
often simple, waiting for further iterations down the business road. When they
grow, it is necessary to improve robustness, in order to not drown in technical
debt. Python might be the right choice here. If handled wisely, the freedom
Python gives us, can be quite a gift: We can start simple for the minimum viable
product, and we can then resolve fragility, adapting more robust coding
patterns. We start with a alpha version that looks very pythonic and end up with
patterns who are inspired by languages which force the developers to build in
more safety into their code.[^rust] 🌻

[^rust]:
    Finally, we might even port the application to Rust, when the need for
    robustness has made our Python code look very much like Rust anyway. 😁
