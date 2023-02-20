---
seriestitle: 'Conceptual Code'
title: Hello From the Other Side
subtitle: Foundations of Conceptual Code
layout: post
---

<div class="flowers">🦊</div>

# 0. The Other Side of Programming

There is a side to computer programming that has nothing to do with computers.
One side is about _implementation_. It is about understanding and leveraging all
the intricate details about _how computers work_. Examples for this include
understanding the difference between interpreted and compiled languages, what
garbage collection is, what a null pointer exception is, how reading from memory
is faster than reading from disk, how database indexes work, and so on and so on.

The community of software developers has become aware of the other side of
programming. Books like _Clean Code_ or _Domain Driven Design_ have become
classics. They are not about implementation. Python and Ruby have become very
popular, because in the trade-off between simple to write (and read) vs.
performant to execute, they heavily lean on the side of simple. They don't focus
so much on improving implementation, but rather the other thing.

While writing _cybernetic instructions_ for the computer, software developers
also communicate _intent_ to the readers of their code. The importance of the
latter is acknowledged in the community, resulting in the often cited creed "We
should write code for the human reader." Although this mantra is widespread,
advice how to achieve this goal seems confined to a set of standard recipes ---
best practices such as "avoid shadowing of identifiers", "avoid overly complex
class hierarchies", "avoid deep nesting", "use telling variable names", "adopt
the early return paradigm", "keep it simple", and so on. Some of those ideas are
even formally defined in some language analyzing tools. When I started working
with ruby, I was surprised how well the rubocop linter is able to encode and
enforce conventions, which often help creating concepts.

Although those conventions reflect insights into the fact that there is more to
computer programming than flipping bit values, we still, I believe, lack a deep
understanding of how to reason about this other side of computer
programming.[^why] We know that in order to write good code that is supposed to
solve a problem, we first need to _understand_ the problem better. But it is
very hard to ever find someone define or explain clearly what that actually
means.

[^why]:
    I believe, the reason for this is that the community is heavily influenced
    by people who studied computer science. It is understandable that they are
    very good at thinking about implementation. When thinking about the other
    side happens, it happens as an accident. And the computer people are
    basically laymen in that field.

There is the famous distinction between _accidental complexity_ and _essential
complexity_, introduced by Frederick Brooks in his famous paper _No Silver
Bullet. Essence and Accidents of Software Engineering_.[^no-silver-bullet]
Brooks gives a definition of what he calls the essence of a software entity:

> This essence is abstract, in that the conceptual construct is the same under
> many different representations.

_Conceptual Code_ is code which is as close to the essence of a business problem
as possible. In order to turn this idea into practice, I want to explore what
that exactly means. At the core, it requires to understand what a
_representation_ of a problem is.

[^no-silver-bullet]:
    Frederick P. Brooks, Jr.: [_No Silver Bullet. Essence and Accidents of
    Software Engineering_](http://www.cs.unc.edu/techreports/86-020.pdf),
    Proceedings of the IFIP Tenth World Computing Conference: 1069–1076.
    September 1986

# 1. Conceptual Code

It is important to turn the definition of this other side from a negative
("other", i.e. "_not_ the implementation" part) into a positive notion. I will
do this in a later article. For now, let's be satisfied with a name: I think,
it is a good naming to call this the _conceptual_ side of computer programming.
Another good name would be to call it the _didactic_ side of computer
programming. While the term _didactic_ highlights that there is something about
the code being easier to grasp, I chose _conceptual_, because I found that
conceptual code has more benefits than just that. But this is a story for a
different post. I would like to spend the rest of this post dwelling on the
point why it is important to care for the conceptual side of code at all.

A lot of conceptual wisdom is accumulated in an implicit manner, and we don't
even think about it anymore. An example: Programming languages tend to prefer
infix notation (`x*y+z`) over prefix notation (`+*xyz`). The general impression
seems to be that it is easier to grasp. Or, another example: Somehow, it has
become an established convention that it makes sense to associate the meaning of
arrow-like symbols (`->`, `=>`) with concepts encompassing some sort of
TRANSFER, such as functions and mappings. Isn't it interesting how a dash and a
greater-than-sign came to refer to something like "mapping", just because they
look like an arrow, and an arrow in turn flies from A to B, so it is sharing the
notion of MOVEMENT or, by analogy, TRANSFER with a mapping. What deep
metaphorical game is going on there!

This implicit knowledge which is enshrined in syntactical sugar is based on
sediments of years of practice, of trial and error -- a slow and sometimes
painful procedure of gaining insights. The objective of writing code that can be
processed smoothly by the human brain can be achieved easier when practical
experience is joined, backed and refined by theoretical insights. The approach
of _Conceptual Code_ is to use findings from cognitive sciences and apply them
to writing software code. We need to understand how the human brain works --
more specifically: how we _perceive_, _order_, _categorize_, and _interpret_
information, how our minds create _concepts_. And we need to take this knowledge
into account when writing code. Then we will gain a new level of confidence, at
which we won't be confined to following established best practices, but will be
able to make informed decisions even in the absence of guiding standard
examples.

Outlining the fundamental premises and describing how this conceptual approach
to writing software code makes sense, this post is the groundwork for a series
of articles which are going to inspect different paradigms and frameworks from
the cognitive sciences and linguistics, and discuss code examples from a
conceptual point of view.

# 2. Logic is Crucial, but not Sufficient

The basic insight, the starting point of _Conceptual Code_ is simple:

> There is a delta between merely correct code (code that meets the
> acceptance criteria) and conceptual code (code that both meets the acceptance
> criteria and is easy to grasp).

There is an infinite number of ways to implement a correct software solution to
a problem. Not all of them are conceptually easy. It takes more to write
conceptual code than it takes to merely write correct code. We should find out
more about the delta.

![logical plus delta equal
conceptual](/assets/conceptual-code-principles/delta.svg){:width="80%"}

In order to function properly, code needs to be logically flawless. Hence,
translating fuzzy language into unambiguous and consistent instructions for the
computer is an important skill for a software developer. Whenever there is an
inconsistency or a vagueness in the requirements, software developers have to be
able to spot and resolve it. And this skill is a strong discriminator for
programmers to start a career: Usually, they are good at understanding a
formalist language which does not resemble human language very
much.[^regex-golf]

[^regex-golf]:
    There are websites for playing regex-golf (the challenge to provide the
    shortest regular expression which matches a given set of strings, but does
    not match a different set of given strings), and even [a whole stackexchange
    network on codegolf](https://codegolf.stackexchange.com/) ("a competition to
    solve a particular problem in the fewest bytes of source code.") If people
    do this, as the site claims, for "recreational purposes", it does not seem
    too risky a bet that they are people who have a thing for formalism.

But this is only one requirement of the job. Another important requirement is to
communicate and collaborate.[^gorman] Part of this requirement of working with
others is the need to write code which can be reviewed and maintained. For that,
it needs to be _conceivable_ first. This does not just ease later refactoring
and iterating on the code, but also reduces the risk of bugs slipping through a
code review: The more mental resources reviewers have to spend on figuring out
what is going on, the less resources they have for thinking about edge cases,
for instance.

[^gorman]:
    A quite interesting talk about this is [Christin Gorman's keynote speech at
    NDC Conference 2022](https://www.youtube.com/watch?v=sSee-aDjtmw) which also
    sheds a light on the gender aspects of this.

There is a lot of different ways, actually, an _infinite_ number of ways to
encode a certain business requirement.[^infinity] This presents the developer
with the problem which of those to choose. There is an algorithmic side to that.
But even for a distinct algorithmic implementation, there is an infinite number
of possible ways to be expressed in code. So, even if we were willing to always
prioritize algorithmic questions over questions of conceivability of our code,
we would still have a lot of choice, i.e. a lot of room to perform badly.

[^infinity]:
    If you insist on a proof: Any boolean statement can be expressed in an
    infinite amount of ways by wrapping it into a double negation. As every
    algorithm will contain boolean statements, this is just _one_ way of
    constructing an infinite amount of logically equivalent algorithms. This
    proof is very boring: We have no problem picking the most readable algorithm
    out of this infinite set of equivalent algorithms -- usually, we will just
    go with the booleans which are not wrapped in double negations at all. So,
    this is really just a proof of existence, which does not tell us much about
    the interesting problems when it comes to choosing between logically
    equivalent algorithms.

# 3. Theory of Mind

When we want to communicate effectively, we need to establish a _theory of
mind_: We need to have an idea of what is happening in the mind of the person we
are communicating with. This means heavy extra effort. That is why teaching is
so hard. We have to think about the thing itself, and then we also have to think
about about the perspective the other person has on the thing, at the same
time.[^lying]

[^lying]:
    This does not only account to teaching, but also to _lying_. It is very hard
    to stick to a made up story, and to orchestrate the beliefs of the people
    we lied to. For cognitive scientists, the heavy mental burden that comes
    with this is part of the explanation of the fact that we usually start to
    believe our own lies -- it is just too expensive to maintain two different
    realities all the time.

In software development, this is particularly hard, because first we need to
create a mental model of the problem ourselves. And after we spent some time
wrapping our head around this, we then have to structure and present it in a
way that is easy for others to understand. If one is a teacher, they usually
start with a good understanding of what they are teaching. But as a software
developer, the understanding of the problem to which we are creating a
solution, is usually quite fresh. Teaching is usually about some well
established knowledge. In programming we often have to _explore_ the problem and
create an understandable representation of it at the same time.

It is a good first step to resort to a set of general guidelines which help us
spot the most common problems. Some of those guidelines are already established
under the name of _self-documenting code_. Another way is to establish a habit
of reviewing and iterating on our own code even before we put it to review.

Another good idea is to write documentation for our code: When writing
documentation, we shift much more into the state of mind of a reader of our
code. I have noticed quite often that I would change the interface of a function
or class when documenting it. Writing documentation made me change my
perspective on the code, putting myself into the user's shoes. Also, writing
documentation is unforgiving in demonstrating if our solution is complicated. If
there is no simple way to explain our code, we have not yet found a good
representation of the problem.

Yet another strategy is to practice reading, understanding and refactoring code
written by strangers, in business domains we are not familiar with, because it
will make us aware of obstacles in other people's code, and we might develop a
sense for smells and anti-patterns.

A fifth strategy (and this is the approach of _Conceptual Code_) is to examine
principles of perception and communication. The better we understand how people
think, and how they _perceive_ code, the better we can write code that is going
to be easy to grasp -- and that means: easy to review, easy to debug, easy to
maintain and easy to adapt to changing business requirements. As software
developers, we should get in touch with disciplines dealing with psychology,
cognitive sciences, linguistics, didactics, design, to some extent even
advertisement and rhetoric.

All these strategies are not mutually exclusive, but can and should complement
each other.

# 4. Summary

The basis of _Conceptual Code_ is a conviction that a lot of knowledge that we
know about natural language can be applied to computer code: There is cognitive
sciences which inform us how humans create concepts by using metaphors and
analogies. There is pragmatics (or pragma-linguistics) which has a lot to tell
about how humans take the communicative context into account when processing
messages. In our attempt to write elegant code, we can even benefit from the
knowledge of socio-linguistic studies which deal with the influence of group
dynamics and conventions on language.

The topic of the upcoming series of articles is to introduce some of those
concepts, and to demonstrate how they can help writing better code.
