---
seriestitle: 'Conceptual Code'
title: How Big is Too Big
title_ending: '?'
subtitle: What Makes an Entity
subtitle_ending: '.'
layout: post
---

<div class="flowers">
🐋
</div>

How big is too big? How small is too small?

The question comes up on any level of software development: How many changes
should be in one commit? How many lines should a function have? How many methods
should a class have? How many classes should be in a module? How many features
should a library cover? How strongly should the database be normalized (how many
columns should the table have)? At what size should a microservice be broken
into two? How big is our team supposed to be, and what should be the scope of
our team? And finally: What is the optimum size of the business?

# Handwaving or Bureaucracy?

There is the principle from UNIX philosophy: "A program should do one thing, and
do it well." Another quite similar formulation, from Object Oriented
Programming, is the "Single Responsibility" principle, the _S_ in _SOLID_. But,
what is a "thing"? What does it mean to be responsible for only one thing?
Another idea is that methods and classes should form a _unit_, as indicated by
the name of unit testing. But what is a "unit"? How do I know my code does not
form a unit?

Another famous example stems from the microservices architecture, from James
Lewis: "A microservice should fit into my head."[^sam-newman] -- a very vague
answer as well.

Those are all formulations that come with a lot of handwaving when one tries to
explain them. It seems that they share a notion of _oneness_, but it is hard to
pin down what that exactly is supposed to mean. Oneness, or _unity_, is a
question that has put bread on the tables of countless philosopher's families
for ages across different cultures. What does it mean in the context of
software? It seems hard to communicate this explicitly and clearly.

Yet, even if there is no clear answer there, those principles share a certain
sentiment: it looks like people who described these had suffered from working with
pieces of software pieces which have been too big or have been trying to do too
much at once.

[^sam-newman]:
    Sam Newman has [a
    video](https://www.youtube.com/watch?v=ZChGXfRDHKA) where he is discussing
    the question of size of microservices. In there, he is
    basically rejecting the question: "A much more telling question is: 'How
    many services can you manage?" The answers he eventually provides could
    hardly be more vague: "Whatever makes sense for you", "It is for every
    organisation to decide 'Where is our happy place on that dial?'", "What's
    important is what works for you", "Find the balance [...] that make sense",
    "Worry less about size, maybe worry a bit more about what you are doing with
    them."

Another approach to the question is to not answer it, but to reject it and shoot
the person asking, on bureaucratic rule at a time.[^exaggeration] In many
organizations, there is a maximum line width of 80 or 100 characters, or on the
line count of a method.[^interview]

[^exaggeration]: This formulation is an exaggeration.
[^interview]:
    In a job interview, I was asked how long my methods usually are, and I think
    my answer ("it depends") left a bad impression, because the interviewer
    wanted to hear a number.

This approach has probably helped to mitigate the problem of software
developers not thinking about size at all and just cramming everything into one
method or "GOD object". They also have some other big advantages: There is no
room for interpreting the rule in different ways, and the rule can be enforced
by static code checkers.

In a bigger group of software developers, such as a company with multiple teams,
those rules might make sense. They provide a minimal set of conventions that
prevent from entities getting crazily big and impossible to handle and they can
be clearly communicated and easily upheld and enforced.

But the formalities won't help when we get into terrain that has not been
formalized yet (for instance: how big is a microservice supposed to be?), and,
also, they won't help us _understand_ anything. They are a pragmatic workaround
around the problem that we have not yet understood what makes an entity, that we
don't know yet what oneness is in software. Skilled and experienced individuals
might have an answer on a case-to-case basis, but they have not yet
found a way to communicate their knowledge so that it can be applied by
everybody and transferred to other contexts.

And even if we have a bureaucratic rule preventing us from the madness of
writing too big classes or functions, madness is also lurking on the other side
of the spectrum: Things can be too tiny, and in order to get anything done, we
need to call a bunch of functions with a lot of meaningless redirection, and it
might get hard to understand the overly complex network that results from units
that are too small.[^extremely-tiny]

[^extremely-tiny]:
    In the code base an employer of mine, there was a so-called "Interactor"
    (a certain kind of class in Rails which basically represents a function with
    a cache) performing a simple string concatenation from two components. The
    requirements of "Do one thing" and "Single Responsibility" were fulfilled
    there 😉.

The raison d'être of handwaving explanations is the shortcomings of the formal
rules and vice versa. Vague hints point to the obvious fact that a formalist
answer will never be able to address context-specific considerations.
Bureaucratic rules point to the obvious fact that vague rules are subjective,
a matter of interpretation, and sometimes utter nonsense.

# Maximize Reusability?

One rule of thumb is to write pieces of code in a way that their reusability is
maximized. Reusability is the probability of a piece of code to be used in a
different place of our application. In isolation, this rule makes no sense. The
only way it appears to make sense is because we automatically refrain from
applying it when it becomes ridiculous, and we tacitly apply other principles in
this case.

The following piece of CSS code takes this principle to its extreme, and is
meant to be a reductio ad absurdum for the principle of maximizing
reusability:

```css
.fontWeightBold {
  font-weight: bold;
}

.fontWeightNormal {
  font-weight: normal;
}
```

These are just two classes, but we can easily imagine how this pattern could be
applied to any CSS style definition. Applying this pattern, we will
successfully define every CSS class in a fashion that maximizes its reusability.
And our CSS classes would be as small as possible. (Our code would even pass a
rule stating that CSS classes ought not be bigger than 3 lines long -- how
cool!)

If we were to apply this principle, we would fundamentally change the use of CSS
classes. What would have been described adequately as _classes_ would then be
turned into something better called _attributes_. (Imagine classes such as
`paddingLeft20px`). As a consequence, the separation of content and style would
be gone. There would be no difference from writing the style definitions inline.
By atomizing the classes, we destroy their _meaning_.

> <p class="emphasis" markdown="1">Atomizing functional units destroys their
> meaning. Meaning materializes as correlations sticking out of the white
> noise of randomness.</p>

Meaning emerges from arbitrary choices (i.e. choices that could be different)
which materialize as correlations sticking out of the white noise of randomness.
This is in no way special about computer code, but rather a general fact about
_meaning_ or _significance_.[^significant-other] By destroying these
correlations in atomizing the pieces of code, we obstruct the communication of
meaning. Instead of maximizing the reusability of each class, we should try to
find out which attributes correlate in a significant way. This significant
association is a meaningful thing. It is a _unit_. It deserves to be represented
in a class of its own.[^tailwind]

[^significant-other]:
    David Kriesel, a data engineer, mined the metadata of the online publication
    of a German journal, _Spiegel Online_ for over two years. By looking at
    correlations, he found significance in the data: The metadata of the
    articles (including day of publication and authors of the article) clearly
    give away the days a journalist is on leave. Kriesel then identified pairs
    of journalists who would consistently be on leave at the same time. From
    that, he was able to deduct which of the journalists at Spiegel Online were
    in a romantic relationship with each other. The full talk of David Kriesel
    including other interesting insights is here: [SpiegelMining – Reverse
    Engineering von Spiegel-Online](https://www.youtube.com/watch?v=-YpwsdRKt8Q)
    (in German).

[^tailwind]:
    The idea to maximize reusability of CSS classes is the heart of [tailwind
    css](https://tailwindcss.com/). It is very interesting to read [the
    reasoning of Adam Wathan, its
    author](https://adamwathan.me/css-utility-classes-and-separation-of-concerns/).
    He offers a diametrically different approach to writing CSS. I think, his
    findings could be harmonized with my point of view by stating that there is
    usually not very much semantics in CSS, i.e. not many stable, significant
    associations, and desperately trying to find some does not work well. I have
    no experience in writing CSS for bigger projects, so maybe the idea of
    conceptual code does fit better for large and complex backend systems. I
    just used CSS as an example for the fact that atomizing units destroys there
    meaning -- a point of view Adam Wathan would agree with, I believe.

# DRY?

Another leading idea for structuring code is that pieces of code should not be
written twice, formulated as the backronym _DRY_ (as in "Don't Repeat
Yourself").

The problem with DRY is the opposite: Pieces of code which look similar do not
necessarily share the same meaning. Meaning manifests itself in correlations,
but the reverse relation does not necessarily apply.

The problem arises when the code has to be changed. Wheny DRYing up our code to
the extreme, we usually end up with a "GOD" object or function -- a very
abstract piece of code which contains all the logic. Because an electric shaver
and an electric lawnmower have _something_ in common, it is not necessarily wise
to have a tool which can act both as a shaver and as a lawnmower, with a switch
to change functionality.

By DRYing our code without paying attention to the underlying meaning, we will
create artifacts which have no correspondence in the problem. Just because there
is a correlation at the current state of our code, this does not mean that this
correlation will remain when our code evolves.

<a name="dry-counterexample"></a>

Here is an example where applying DRY would turn out to be a
mistake:[^stackoverflow]

[^stackoverflow]:
    This is taken from a post on stackoverflow: [Is violation of
    DRY principle always bad?](https://stackoverflow.com/a/17790368/3566606)

```javascript
// In place A
const price = basePprice + price * 0.1 // account for VAT

// In place B
const price = basePrice * 1.1 // account for VAT

// In place C
const price = basePrice * 1.1 // add 10% markup for premium service
```

A fully DRY refactoring would be to define the following function and use it in
all three places:

```javascript
function calculatePrice(price) {
  return 1.1 * price
}
```

But that would likely just add more work further down the road and even
introduce a source of bugs. The fact that the markup for the premium service is
the same as the VAT is but a _coincidence_. A better refactoring would be:

```javascript
const vatPercentage = 1.1
const serviceFeeMarkup = 1.1

function accountForVat(price) {
  return vatPercentage * price
}
function accountForServiceFee(price) {
  return serviceFeeMarkup * price
}
```

The methods `accountForVat` and `accountForServiceFee` _happen to be_ logically
equivalent, but this is a mere coincidence. Applying DRY "blindly", or
"dogmatically" (i.e. by looking only at the syntactical similarities of the
pieces of code) would actually create problems here instead of solving some.

# AHA?

One might say that the previous two sections are simply a misunderstanding of
applying DRY or reusability as software principles -- no single principle will
ever be able to provide a perfect guidance on its own; any rule is only working
well if applied within certain limitations, and in order to understand the full
picture, it will always require a pluralist concert of principles which need to
be applied together and traded off against each other wisely, taking into
account the specific requirements of the application.

And that is true. But then, the explanatory value of a principle is limited, if
it is not made explicit what its limiting factors are. A rule that works for a
while, under certain circumstances, is good. A rule which is explicit about its
limits of application is better. A rule which can be applied beyond those limits
is even better.

If DRYing up our code or maximizing reusability is not always the best approach
to structuring our code, how can we identify the cases where these principle
fail and what should we do then?

One answer to this has been another backronym: _AHA_[^kent] (as in "Avoid Hasty
Abstractions"). The bottom line of this is "prefer duplication over the wrong
abstraction". And this guideline is right. It also does not mean much, because
saying "Prefer X over wrong Y" is usually turning out to be a good advice,
regardless of X and Y (it is an analytic truth). What is a "wrong" abstraction,
and how can we spot it? Let's listen to the inventor of AHA, Kent Dodd:[^kent2]

[^kent]: [Kent C. Dodds: _Aha Programming_ on kentcdodds.com](https://kentcdodds.com/blog/aha-programming)
[^kent2]: In the blog post mentioned just above.

> I think the big takeaway about "AHA Programming" is that you shouldn't be
> dogmatic about when you start writing abstractions but instead write the
> abstraction when it feels right and don't be afraid to duplicate code until
> you get there.

This answer ("when it feels right") is not satisfying. If there is some wisdom in
there, it is not made explicit. As it stands, AHA is just the observation that
DRY can go wrong. It is a _negative_ statement, a destructive one, if you will
(it "destroys" the idea that DRY is perfect), but it does not have much to offer
on the _positive_, constructive side.

# Likelihood to Change Together

When we approach the question from a testing perspective, we will find that a
_unit_ can be identified as "something that changes together". That is also how
the term "single responsibility" of a class has been defined: "a class should
have only one reason to change". This principle would emerge when looking at
writing tests from an economic angle: When we organize our units under test in
that way we will reduce the work needed to rewrite tests in the course of the
evolution of our program requirements.

When following this approach, we will have to estimate how likely a certain
thing is to change. It is a little like getting married: You should ask yourself
what are the circumstances that would make you part from your partner (pun
intended), and if you feel that those scenarios are likely to occur, it might be
a good idea to not get coupled (yet).

Let's have a look at the following variable definitions:

```javascript
const address = 'https://some-api.com'
const version = '1'
const baseUrl = address + '/v' + version
```

The code differentiates `address` and `version` of the API. Is this reasonable,
or is it nitpicking? Is the `version` likely going to change independently from
the `address` of the API? We don't really know. The version might actually
never change at all. But still, conceptually, the version is a different "thing"
than the address of the API. They are _logically independent_. That means they
can change independently from each other _without our whole understanding of the
API falling apart_: Imagine an API where the address would change each time they
release a new version. While this might have happened somewhere in the wild
(probably, because developers didn't add a version part to the URL when they
released version 1), it looks like an aberration. If we were to release an API
in that manner, we would give up the conceptual difference between version and
address, indeed. And then it would make sense for the client not to treat them
as different entities, but to conceptualize them as _one_.

> <p class="emphasis" markdown="1"> The notion of _oneness_ is relative to our
> conceptualisation.

Notice how the term _logically independent_ relates to our conceptualisation of
the problem. The oneness of something is not actually a matter of the things,
but differs based on how we conceive it. That is why we might want to say
_conceptually independent_ instead of _logically independent_ in order to stress
this. We can successfully apply this concept to the [example from the DRY
section above](#dry-counterexample): We do not want the calculation of the
premium fee to change whenever the vat percentage changes and vice versa. The
two are conceptually independent.

In the setup of how API addresses are usually structured, the conceptual
difference between version and address is even indicated in the structure of the
URL, as they are visually separated from each other by a backslash `/` -- a
character that even looks like a symbol that is meant to indicate a boundary.
The whole URL is _modular_, with the address, the version and the path elements
all referring to meaningful units.

# The Answer is Conceptual

So, does it make sense to write three lines of code here instead of simply one?
This is clearly a low-impact example, so it would be a little academic to
seriously discuss this in depth (and just to put the minds of my colleagues who
might read this at ease: I would never make this a comment in a PR review). But
it shows that it is often much easier to identify something as a "unit" than it
would be to predict the actually likelihood of change.

The way the variable definitions above structure the information contains
another conceptual signal to the reader: Notice how the `https` protocol is
baked into the `address` variable. The signal here is that the author of the
code never intends to call the API over `http`. Although from a technical point
of view, the address and the protocol are surely very different things, the
person who wrote those lines above decided that this difference is unproductive
in the current context. In the context of the API client, this differentiation
would be noisy, as it does not refer to a difference in usage.

The idea "things that change together form a unit" is a strong reminder of
the _principle of common fate_ in the Gestalt theory of perception:

> The common fate principle states that elements tend to be perceived as grouped
> together if they move together.[^common-fate]

![common-fate.gif](/assets/how-big-is-too-big/common-fate.gif){:width="60%"}

<p class="caption" markdown="1">Illustration of the principle of common fate:
Dots moving together are perceived as group, if all other characteristics
(shape, color, size, distance to neighbours) do not differ between groups.</p>

[^common-fate]:
    [Dejan Todorovic: _Gestalt Principles_ in
    scholarpedia.org](http://www.scholarpedia.org/article/Gestalt_principles#Common_fate_principle)

Initially, the principle of common fate has been described for the visual
domain, but it has been demonstrated for other senses as
well.[^auditory-gestalt-principles]

[^auditory-gestalt-principles]:
    See, for instance: Diana Deutsch: _Musical Illusions and Phantom Words: How
    Music and Speech Unlock Mysteries of the Brain_, Oxford University Press
    2019, Chapter 3: _The Perceptual Organization of Streams of Sound_, or [Han
    Li , Kean Chen , and Bernhard U. Seeber: _Gestalt Principles Emerge When
    Learning Universal Sound Source
    Separation_](https://mediatum.ub.tum.de/doc/1661313/dm4ukrxvj4yzxgnloarm4r45b.Li_Chen_Seeber22_TASLP_Gestalt_Principles_Emerge_When_Learning_Universal_Sound_Source_Separation.pdf),
    IEEE/ACM Transactions on Audio, Speech, and Language Processing, Volume 30,
    2022, p. 1877-1891.

Is "determining the conceptual units" and "predicting which things are going to
change together" two different principles, or is the first just a different
formulation which boils down to an equivalence to the second?

It makes totally sense to see them as different façons de parler, as
interchangeable formulations. This is how: The term "likelihood to change" is
actually not well-defined (in a mathematical sense). Any probability is defined
only in the context of a structured probability space.[^monty-hall-problem] And
this underlying structure is _nothing but_ our conceptualisation of the problem.
So, the term "likelihood to change together" is actually relative to our
conceptualisation. That means, there will be many ways to define this
likelihood. If we define our units along conceptual boundaries, we will end up
with what is de facto an estimate of the likelihood to change together.

[^monty-hall-problem]:
    Mathematically, the definition of a probability is bound to the definition of
    the underlying probability space (see: [Kolmogorov
    Axioms](https://www.wikiwand.com/en/Probability_axioms)). The definition of the
    probability space implies a way to structure the possible outcomes of a
    probability experiment. That means, any talk about probabilities is preceded
    by a certain interpretation, by a certain _conceptualisation_ of the reality
    which is meant to be described by the probability experiment. The most
    illustrative example of this is the [Monty Hall
    problem](https://www.wikiwand.com/en/Monty_Hall_problem), where the
    conceptualisation of what is happening is key. Small reformulations of the
    experiment (and the implied assumptions) lead to different outcomes of the
    winning probability.

The definition "things form a unit if they are likely to change together" is
great: It outsources the context-dependent parts of what a unit is to the
definition of likelihood, i.e. to the underlying conceptualisation. But with
that premise, it is a crystal clear definition of _oneness_. The formula could
even be reformulated to "things form a unit _in so far as_ they are changing
together". Instead of "change" we can also use "respond to external stimulus"
here.[^applications]

[^applications]:
    Try to apply this idea to anything in the real world, and it is
    fascinating how broad this is. Look at, for instance: 1. A billiard ball
    comprised of molecules, 2. A marriage comprised of two people, 3. An
    orchestra or a band comprised of its musicians, 4. A nation at war.

When try to understand the conceptual boundaries of our units, we are going to
ask questions like: What are the core concepts in the problem we try to solve?
What are scenarios for things to change? Here the term "likelihood" might not
seem to be the appropriate notion anymore. We do not really assess the
likelihood of things to change together in a numerical sense. That is why I find
the formulation to look for conceptual boundaries of the entities more
illustrative, although it is just another façon de parler to express the same
idea.

# Example: HTTP Exception Handling

OK, let's see an example. Let's imagine we have an HTTP service. We have some
routing and a controller level, and "underneath" the controller level, we have
all the business logic.

Let's say we have a process which creates a `User` with an email. The database
layer will raise a `DuplicateUserEmail` exception, if the email is not unique in
our system. Let's imagine, we have a controller for the `POST /users` endpoint,
for creating a new user. If `DuplicateUserEmail` is being raised downstream,
this should lead to a `400 - Bad Request` HTTP response. We might want to catch
and handle the exception in the controller. An example how this could look in
Ruby on Rails:

```ruby
module OurApp
  class UserController < ActionController

  rescue from OurApp::DuplicateUserEmail do
    render nothing: true, status: :bad_request
  end

  def create
    OurApp::User.create(user_params)
  end

  private

  def user_params
    # sanitize the parameters here
  end
end
```

So far, so good. Now, let's imagine, in the course of our service growing
bigger, we write other controllers, where the same logic is happening: Somehow,
a `DuplicateUserEmail` gets raised, and the controller should response with a
`400 - Bad Request`.

Is it time to extract the error handling? A lot of web frameworks nudge us to do
this. In Laravel, for instance, we can define a custom `ExceptionHandler`, or
we can define the rendering of the exception on the exception class
itself.[^laravel-exception-handling] In FastAPI, we can subclass our exception
class to an `HTTPException` base class, to define how the exception is being
rendered.[^fastapi-exception-handling] In Rails, we can write a custom
`ActionController` subclass (usually called `ApplicationController`), define the
global error handling there, and have all our controllers inherit from
it.[^exception-handling-in-python]

[^laravel-exception-handling]: [Laravel Exception Handling](https://laravel.com/docs/10.x/errors#the-exception-handler)
[^fastapi-exception-handling]: [FastAPI Exception Handling](https://fastapi.tiangolo.com/tutorial/handling-errors/)

So, when should we extract the logic of catching `DuplicateUserEmail` and
rendering the 400 response? Should we do it at all?

DRY would tell us to do it: We have multiple instances of the same logic, so
let's not repeat ourselves. AHA would say: let's wait a little. And as soon as
it feels right, let's extract it. (It might start feeling right after two or
three occurrences of repetition.)

But from a conceptual point of view, we should not do it. The error
`DuplicateUserEmail` exists on the business logic (it actually represents a
constraint on the data level). From a conceptual point of view, the fact that we
want to map this kind of error to a `400` response is but a coincidence. A
duplicate email could be caused by other reasons than by input from the client
being flawed. The database layer, where the exception is generated, cannot
know the root cause of the problem. That's why tying this exception to a
particular root cause would be an artificial association -- conceptual noise.

What appears to be a duplication from a mere syntactical point of view is a
decision to interpret the signal from the business logic on a case to case basis
from a conceptual point of view. That way we ensure that business logic and
controller logic remain conceptually independent (uncoupled): They are allowed
to change independently from each other.

[^exception-handling-in-python]:
    This approach followed by Laravel, Rails, FastApi and others is called the
    "bubbling up" approach, and I have discussed it in more detail in [a post on
    exception handling in Python]({% post_url
    2023-02-06-what-does-it-mean-to-be-exceptional %})

# Summary

When we structure our code, we make a bet on the _latent grammar_ of the problem
domain. The best estimation about how this latency is going to materialize in
the future is to identify the concepts underlying our problem.

Conceptual boundaries can be identified by thought experiments: What are the
scenarios in which two things develop in different directions? Would they change
the understanding of the whole problem?

Blindly DRYing our code errs on the side of _overfitting_ the grammar of the problem.
Maximizing reusability to the extreme is a one-size-fits-all approach and errs
on the side of _underfitting_.

DRY, as a refactoring principle, only had a chance to be successful, because it
does indeed _correlate_ with conceptual coding. That is because parts of code
that belong to the same concept will inevitably share code. When tackling
repetition we will probably sort some parts of code together which also belong
together _conceptually_, just by chance. But there will be cases, where we put
two things into the same bucket, although they belong to different concepts.

From that perspective, DRY is a semantics-free, context-free _approximation_ to
conceptual coding. It fails exactly in those cases where context and meaning do
matter.
