---
title: What Does It Mean to Be Exceptional?
subtitle: How to Handle Exceptions in Python.
tags: Python, Conceptual Code, Exception, Technical Debt
layout: post
toc: true
---

What does it mean to be exceptional? --- This is not just a question for artists
and teenagers, but also for software developers. It touches the question how
we should organize our code in a similar way it touches a society. And the
answer is the same for computer programs which it has been for generations of
teenagers striving to be cool: what is "normal" and what is "deviant" cannot be
decided without context, but it essentially depends on the constitution of the
surroundings it is embedded into.

As writers of code, we are the ones defining its constitution. By using exceptions, we
create an implicit hierarchy. We should organize status in our code in a way
that helps our readers making our code more easy to understand:[^hierarchy] If
our computer program was a painting, what would we want to be the foreground in
that painting, and what do we want the spectator to consider background?
Exceptions mean an opportunity to structure the perception of our reader and
provide guidance.

[^hierarchy]:
    Luckily, the organization of computer code differs from the organization of
    society in the aspect that the definition of norm and deviance does not do
    any harm to anyone.

This article discusses different strategies of exception handling. The main
story is about Python, but some basic insights are rather general and can be
applied regardless of the programming language.


# 1. Exceptions in Different Languages

In the trade-off between development speed and code robustness, Python often
gives us the freedom to write fragile code. One example for this is the absence
of strict typing. Another example is how we could steer the control flow of a
Python program with exceptions: In Python, it is possible to throw an exception
using `raise`, which if not caught in a `try`-`except` block, will make the
program crash.

The absence of a safeguarding mechanism forcing the developer to ensure that
exceptions are caught, makes for quick prototyping. It also introduces a
potential fragility. While development speed is nice, fragility is technical
debt and can become a pain quickly.

Other programming languages (including some well-known for developer
satisfaction such as Rust, or Elixir) do not use exceptions in that same fragile
way. Instead, they use return values for signalling exceptional behavior.

In Rust, functions may return a `Result`, which can be either an instance of
`Ok` or `Err`. When working with an instance of `Result`, we can call its
`.unwrap()` method, which will either return the wrapped value or raise the
exception.

Similarly, in Elixir, it is a convention to return a pair, containing either an
`:ok` or `:error` atom, and the actual return value. Elixir's way of defining
function signatures with pattern matching shines at making the control flow very
tangible: the _happy path_ and the _error path_ can actually be expressed as
different paths in the code. This allows for rather complex error paths without
loosing track of what is going on:

{% highlight Elixir %}
def to_age(value) when is_binary(value) do
  case Integer.parse(value) do
    {:ok, integer} -> to_age(integer_value),
    {:error, _ } -> {:error, "age string must hold number"},
  end
end

def to_age(value: integer) when value < 0 do
  { :error, "Come on, your age cannot be negative!" }
end

def to_age(value: integer) when value > 122 do
  {
    :error,
    "Jeanne Calment, the oldest person ever,"
    <> "got 122. Are you sure you are older?"
  }
end

def to_age(value: integer) do
  {:ok, Age(value)}
end

def to_age(value) do
  { :error, "age value must be a binary string or an integer" }
end
{% endhighlight %}

In other strongly typed languages, for instance Java, it is possible to throw
exceptions, but the developer has to declare all the possible exceptions a
function could throw in the function signature.


# 2. Micro- vs Macro-Structure

If we look at the micro-structure of our code, inspecting functions in
isolation, raising an exception makes totally sense: If we have a method that
relies on opening and reading a file, it seems a very good fit to raise a
`ValueError` if a file under the given filename does not exist. The semantics of
the exception express the _intent_ of the code very directly. And that is always
a good thing.

But problems might emerge on the macro-structure of our code. How do functions
which potentially raise cooperate smoothly in the context of the whole program?
What do have their callers (and the callers of their callers) and have to know
in order to work with them safely? How can life be made easy for the caller? We
will see later in examples that there are problems lurking when we use raising.
These problems are the reasoning for the programming languages which prefer to
signal exceptional scenarios in the return value of the function instead of
making the function throw an exception.

As other languages do it differently, why does Python allow to raise, in the
first place? Similar to the value a certain function returns, an exception is
some sort of a "response" of that function. Next to the parameters it accepts,
and the values it returns, the possible exceptions a function might raise are an
essential part of the function's interface. And "the function's interface" is
just a different name for "what matters for the caller of the function". It is
what matters when we think about the macro-structure of our code.

But other than the parameter specs or the return type, exception specifications are
not part of the function's signature or type annotation.[^guido] When we write a
caller for the function, neither the compiler nor the type checker can provide us
any help: We have to inspect the body of a function in order to be sure when
handling the "response" of the function, we cover the full spectrum of
possibilities. And this is where trouble might happen.

[^guido]:
    And Guido van Rossum, the creator of Python, [has expressed strong
    opposition against including exception annotations in Python's type hinting
    system](https://github.com/python/typing/issues/71), making it very unlikely
    that we are going to see this becoming a feature in Python in the sooner
    future.


# 3. Difference between Returning and Raising

From that point of view, it looks as if raising an exception was just some sort
of creating an "unofficial" response off the books. But is there another, more
fundamental difference between raising and returning? What is the _essential
difference_ between returning and raising?

Well, there is none, really. Have a look at the following code snippet:


{% highlight Python %}
from typing import NoReturn


class ResultDisguisedAsException(Exception):
    def __init__(self, value: Any) -> None:
        self.value = value


def function(value: int) -> NoReturn:
    # apply some operations to value
    raise ResultBeingRaised(value)


def caller():
    try:
        function(1)
    except ResultDisguisedAsException as result:
        # do something with result.value
{% endhighlight %}
*__A way how to misuse exceptions to replace return statements.__*

In this snippet, the function basically responds by raising instead of returning
a value. The caller does not use the returned value, but inspects the exception
in order to get the relevant information. This is ridiculous, of course. But it
demonstrates that there is no _essential_ difference between raising and
returning: Logically, any Python program using methods with `return` statements,
could  be rewritten using `raise` statements exclusively.

That proves that the difference between raising and returning is _arbitrary_. For
understanding the difference between raising and returning, we cannot rely on
trying to understand the _essence_ of these terms, as _essentially_, they are
not different. Asking "What are the essential characteristics of an exception?"
is a little like asking "What are the essential characteristics of a gift?".
Well, anything can be a gift. Whether a certain object is a gift or not, cannot
be found in the specifics of that object, it can only be found in the way that
object is being used. And the same applies to exceptional scenarios in Python
code.


# 4. Structuring Code with Exceptions

The meaning is defined by the use in our code. We cannot _understand_, we
have to _decide_ what we want to consider an exception and what not; or,
better: By returning or raising something, we implicitly shape the semantics
in our code.

In order to discuss different strategies that we can apply, let's have a look at
very common architecture with an entry point, a layer which performs some sort
of validation, a layer for the business logic, and a "persistence layer"
(sometimes called "repository layer") which handles reading and writing of data,
abstracting away the specifics of the data storage:

![layered architecture](/assets/what-does-it-mean-to-be-exceptional/layered-architecture.svg){:style="display:block; margin-left:auto; margin-right:auto"}
*__Abstract Minimal Example of a Layered Architecture.__*

Consider, for instance, a GET endpoint in a REST API, which is requesting a
single movie from our database, based on some filter criteria, such as title,
language, director, or starring actresses and actors, you name it.

The real life example could of course be more complex. We are just focussing on
the elements that are relevant to demonstrate the up- and downsides of different
exception handling strategies.



## 4.1 Bubbling Up

One strategy of handling exceptions is to have them "bubble up". The metaphor
involves that the outer layers are on the "top", and the inner layers are on
the bottom. Any exception raised on a lower level is not handled directly on the
next level, but only at the very top layer. That way intermediate layers can
simply ignore exceptions on lower layers, taking some complexity off their
shoulders:

![bubbling-up](/assets/what-does-it-mean-to-be-exceptional/bubbling-up.svg){:style="display:block; margin-left:auto; margin-right:auto"}
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


def movie_filter_controller(filters) -> Movie | None:
    # Skipping validation logic part of this layer
    try:
        return movie_filter_service(filters)
    except NotFound:
        return None


def entry_point(filters) -> Movie | None:
    return movie_filter_controller(filters)
{% endhighlight %}

The snippet demonstrates, how the service layer does not care about the
exception at all. The exception is passed upwards without the intermediate
layers even taking notice, kind of "behind their back".

One example where this approach is leveraged, is the `fastapi` web framework. It
has a particular exception class `HTTPException`. In handling an HTTP request,
whenever the downstream code raises this exception, the framework turns this
into the appropriate HTML error response. `fastapi` is created for developing
HTTP APIs quickly, and this feature helps with this: In whatever layer of our
code -- when fetching data from the database, when reading configuration, when
validating input data, you name it -- we can simply raise an `HTTPException`
with the appropriate HTTP error code. You do not need to handle those anywhere,
because the framework ultimately takes care of it. The exceptions bubble up
silently (i.e. without being handled in each layer) to the controller, and,
ultimately, they are going to end up as an error response to the caller of our
API. If we are just interested in getting things going quickly, this is very
appealing.

In order to make this approach work, our repository method would have to raise
some sort of exception indicating that the movie could not be found. This makes
sense in the scope of the simple example. But it has the downside of coupling
the repository to the business logic: The repository would have to know that the
`NotFound` exception is meant to bubble up.

But is that really something we should consider an exceptional case? From the
perspective of the repository, we actually might _not_ consider this an
exception. It should be perfectly expected that the repository does not hold all
the movies that are out there. Hence, a request against our data which does not
lead to a hit should not be unexpected at all. It does not necessarily indicate
that anything in the request is _wrong_, if our database does not hold a
matching movie.

That emphasizes the fact that our implementation of the repository has to be
understood _in the context_ of the rest of our program. And that is an
indication of a lack of decoupling.


## 4.2 Shadow Control Flow

If our code logic is very simple, we might get away with the bubbling up
approach. But it can get messy:

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
messy](/assets/what-does-it-mean-to-be-exceptional/shadow-control-flow.svg){:style="display:block;
margin-left:auto; margin-right:auto"} *__In a shadow control flow, exceptions
are handled on a case-to-case basis. It quickly gets messy and hard to trace.__*

That is how the bubbling up strategy is at risk of deteriorating into a "shadow
control flow". It is "in the shadow", because it is a second control flow which
is not expressed in the regular control flow established by calling and
returning, but is working "behind the scenes".

The underlying problem is the coupling of the repository layer
with the controller layer.


## 4.3 Watertight Exception Handling

In order to avoid ending up with a spaghetti logic for handling exceptions in a
shadow control flow, it makes sense to apply a more tightly supervised approach.
Bringing order into the chaos of a shadow control flow, we could either never
raise any exceptions at all, or we could give the caller the responsibility to
catch all exceptions raised by the called function and handle. The obvious
advantage of this approach is that it is dead simple. The downside is that with
this approach, we have to write more lines of code. This is basically the
tradeoff between being more explicit or being more concise.

Both approaches, explicitely handling all exceptions, and not raising any
exceptions, have very similar effects in helping the reader grasp the
macrostructure of our code.

But there is one difference, and this is specific to Python and its typing
system: the exceptions that are potentially being raised of a function are not
part of the type specification of this function. That means that whenever we
call a function, we would have to check whether it does have a raising scenario.
If we use Python's typing system already (and most often, we should), the
approach

So, let's have a look at how a paradigm of indicating exceptional behavior
throug the return value of the function instead of through raising an expression
can be applied:


# 5. Returning Instead of Raising

## 5.1 Option One: Meaningful Return Values

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
went wrong" when trying to create an instance of Age__*


Sometimes, we can also use the semantics of a return value in order to indicate
an edge case. The behavior `Array.prototoype().indexOf` in JavaScript is a an
example of this: If `someArrray` does not contain `value`,
`someArray.indexOf(value)` will be  `-1`. In JavaScript, string indexes can only
be positive, so returning a negative index uses that deviation from the
semantics in order to signal the occurence of an edge case.[^negative_index]

[^negative_index]:
    Python uses negative indexes to indicate that the index is counted from the
    end, so using this signal in Python would not exactly express the same
    meaning as in JavaScript.

A lot of scenarios can be covered by exploiting the semantics of the return value.


## 5.2 Option Two: Returning an Exception

But sometimes there are scenarios, where a meaningful return value is not
enough.

For instance, the above example from JavaScript returning `-1` as the index for an
absent value is not super clear. For anybody who is not familiar with it
already, it would involve some guesswork to understand it. Also, and this is
more important, the _type_ of the returned value is still an integer, so there
is not type difference between the normal path and the exceptional path, the
function signature does not highlight the edge case. The consumer has to _know_
that `-1` is the signal for an exception. And this is similar to the situation
where the consumer has to know which exceptions are raised: The type annotation
of the return value in the function signature does not reveil the error-signal
properly, so the caller might miss to handle the exception case properly.

For a well-establised function from the standard library, that might be
acceptable. But for a lesser-known function our future selves have to conumse,
this might be considered a surprise, a gotcha or even a what-the-f\*\*\*.

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

Another use case is that that `None` is actually a valid value of the function.

In those cases, a very clean approach is to create an exception, but not raise them, but
return them: The return. That way, we can signal the s

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

This is a way of making the expection handling more robust. Now the possible
exceptions are part of the type annotation of a function. This makes the control
flow much more explicit, and it leverages the power of our typechecker: Now,
the typechecker will tell us if we forgot to handle an exceptional path. If,
for some reason, we want our program to actually panic with the correct
exception, the caller can still decide to raise the exception, making use of the
trace of the exception.


## 5.3 Alternative Two (Improved): Result Wrapper

In those cases, it makes sense to adopt the behavior Rust, Elixir and Go take:
We can use a wrapper class to indicate the result or success in the function
signature.


The following code snippet is a sketch of an implementation of this approach in
Python. Effectively, this opens the door of using the typechecker to ensure that
all exceptions are handled.

{% highlight Python %}
from typing import Generic, NoReturn, TypeVar

OkType = TypeVar("OkType") ErrType = TypeVar("ErrType", bound=Exception)

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


# 6. Shades of Grey: How to Trade-Off

So far, we have seen different approaches. It is quite clear that we will want
to avoid creating a shadow control flow. But for the other approaches, we have
not. As often, many ways are possible. Let's have a closer look at the
trade-offs:

In a pragmatic world, where writing software is always a matter of trade-offs,
we should see different approaches as an amplification of our repertoire to opt
for the necessary amount of robustness that our codebase needs. Just because we
write Python, it does not mean, our code has to be fragile. 😉 Python allows us,
but does not force us to create a shadow control flow of exceptions.

Python is a simple programming language. That is why it is, next to JavaScript,
one of the programming languages many developers start coding with. Not having
to deal with type hinting and exception handling is definitely a way to keep the
entrance bareer into the language (and into programming) low. And that can be a
good thing. If we train a junior programmer or a non-programmer, maybe it is OK
to have them work on tasks that are fairly simple, and which do not require that
level of robustness.

The more mature our trainee gets as a software developer, the more we will
want them to be able to handle complex code bases. Those demand stronger
robustness of code, because pain gets unbearable otherwise.

Next to developer maturity, code maturity is a factor to consider, too: In an
agile environment with rapid prototyping and, first versions do not have to be
perfect. Their functionality is often simple, waiting for further iterations
down the business road. When they grow, it is necessary. Python might be the
right choice here. If handled wisely, the freedom Python gives us, can be a real
gift: We can start with the technical debt for the minimum viable product, and
we can then resolve the fragility, adapting more robust coding patterns. We
start with a alpha version that looks very pythonic and end up with patterns who
are inspired by languages which force the developers to build in more safety
into their code.[^rust]

[^rust]:
    Finally, we might even port the application to Rust, when the need for
    robustness has made our Python code look very much like Rust anyway. 😁


---


But before we have a closer look at that statement, it seems worth noticing that
the examples from the Python standard library are not very helpful in order to
provide a clear notion of exceptional behavior: In the standard library, the
boundary between the regular control flow and the exception control flow is
rather blurry. For instance, calling `.next()` on an iterator raises a
`StopIteration` when the iterator is exhausted. In practical terms, most
iterators are finite. Hence, the fact that an iterator gets exhausted, is not
really an _accident_. If we try to maintain a stricter boundary between regular
control flow and exceptions, we might consider the possibility of making our
programm panic because of an exhausted iterator a stretch.
