#!/usr/bin/env perl

use strict;
use v5.10;
use JSON;
use Getopt::Std;
my @data;
our $opt_s;

my $id = 100000;
srand(100);

while(<DATA>){
  chomp;
  my $name = $_;
  s/([^a-z\s])//gi;
  next unless m/^(\w+)(?:\s+(\w+?)\b)?/;
  my $key = uc("$1$2");
  push @data, {
    "id" => "$id",
    "expand" => "description,lead,url,projectKeys",
    "self" => "http://localhost:9090/rest/api/2/project/$id",
    "projectTypeKey" => "software",
    "projectCategory" => {
       "name" => "LIST OF BUZZWORDS",
       "id" => "100500",
       "self" => "http://localhost:9090/rest/api/2/projectCategory/100500",
       "description" => "https://en.wikipedia.org/wiki/List_of_buzzwords"
    },
    "avatarUrls" => {
       "32x32" => "http://localhost:9090//secure/projectavatar?size=medium&pid=$id&avatarId=$id",
       "16x16" => "http://localhost:9090//secure/projectavatar?size=xsmall&pid=$id&avatarId=$id",
       "48x48" => "http://localhost:9090//secure/projectavatar?pid=$id&avatarId=$id",
       "24x24" => "http://localhost:9090//secure/projectavatar?size=small&pid=$id&avatarId=$id"
    },
    "name" => $name,
    "key" => $key
  };
  $id += 100;
  $id += int(rand(400));
}

getopts('s');
if(not $opt_s){
  print JSON->new->pretty(1)->encode(\@data);
}else{
  my $maxRes = 10;
  my %search = (
    expand => q[schema,names],
    startAt => 0,
    maxResults => $maxRes,  
    total => scalar(@data),
    issues => []   
  );
  for(my $i = $#data; $maxRes > 0; $maxRes--,$i--){
   my $id = $data[$i]->{id};
   my $key = $data[$i]->{key};
   push @{$search{issues}}, {
     expand => q[operations,versionedRepresentations,editmeta,changelog,renderedFields],
     self => qq[/rest/api/2/issue/$id],
     id => $id, 
     key => qq[$key-$id]
   }; 
  }
  print JSON->new->pretty(1)->encode(\%search);
}

__DATA__
Aggregator[63]
Agile[64]
Ajax[8][58]
Algorithm[65]
Benchmarking[66]
Back-end[31]
Beta[8]
Big data - larger data sets than last month
Bleeding edge[31]
Blog[63] – plus various other words that incorporate "blog"
Bring your own Device - use of personal equipment (usually mobile) in a work environment
Bricks-and-clicks[31][31]
Clickthrough[31]
Cloud[67]
CloudOps
Collaboration[68]
Content management[68]
Content Management System[63] – also known as CMS.
Convergence[69]
Cross-platform[31]
Cyber-physical Systems (CSP)
Datafication[70]
Data mining[71] - any kind of data collection or analysis, even simple statistics such as taking averages on large data sets
Data science[72]
Deep dive[17]
Deep web[73] - used interchageably with "Dark web" even though they're not the same
Design pattern[74]
DevOps[75]
Digital divide[63]
Digital Remastering[76]
Digital Rights Management[8] – also known as DRM.
Digital signage[77]
Disruptive Technologies[78]
Document management[68]
Dot-bomb[15][31]
E-learning[80]
End-to-End
Engine[81]
Enterprise Content Management[63] – also known as ECM.
Enterprise Service Bus[82] – also known as ESB.
Evolution - Often use ambiguously in political or sociological arguments in reference to theories of social Darwinism. (e.x. "Society has evolved.")
Framework[8]
Folksonomy[63]
Fuzzy logic[83]
Growth Hacking
HTML5[84]
Immersion[85]
Information superhighway / Information highway[8]
Internet of Things[86]
Innovation[87]
Machine Learning
Mashup[8]
Microservices
Mobile[88]
Modularity[89][90]
Nanotechnology[91]
Netiquette[63]
NFV- Network Function virtualization
Next Generation[85] (also "NextGen")
Object-Oriented Programming
Omnichannel
Pandering
Parsing
PaaS
Podcasting[58][63]
Portal[31]
Real-time[63]
Responsive Web Design[92]
Sensorization[93]
SaaS[58]
Scalability[94][95]
Skeuomorphic
Social bookmarking[58]
Social software[63]
Software Defined _blank_
SDN- Software defined Networking
Spam[63]
Sync-up[15]
Systems Development Life-Cycle
Tagging[63]
Think outside the box[63]
Thought Leader
Transmedia[96]
UC - Unified Communications
User generated content[97]
Viral
Virtualization[58]
Vlogging[63]
Vortal[98]
Web 2.0[8][58][63]
Webinar[31][63]
Weblog[63]
Web services[68]
Wikiality[99]
Workflow[6]
