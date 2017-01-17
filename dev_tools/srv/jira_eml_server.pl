#!/usr/bin/env perl

=head1 SYNOPSIS
  >cpan -i AnyEvent::HTTPD
  >cd JiraLinkExpanedr/dev_tools/srv
  >perl ./jira_eml_server.pl
  > GET http://localhost:9090/rest/api/2/project
=cut

use strict;
use autodie;
use AnyEvent::HTTPD;
use Getopt::Std;
our $opt_p;
getopt('p');
$opt_p ||= 9090;
my $httpd = AnyEvent::HTTPD->new (port => $opt_p);

sub slurp ($){
  return do {
    local $/;
    open my $fh, "<", shift;
    <$fh>;
  }
}

sub errlog (\@){
  my $msg = shift;
  print STDERR ((join " ", @$msg)."\n");
}

$httpd->reg_cb (
  request => sub {
    my ($httpd, $req) = @_;
    my $url = $req->url;
    my @msg = ("[@{[scalar localtime()]}]", "GET $url");
    if($url =~ m{/rest/api/(?:2|latest)/(\w+)}){
      my $fname = "data/$1.json";
      if(-f $fname){
        push @msg, "ok";
        $req->respond ({content => ['application/json', slurp $fname]})
      }else{
        $req->respond (404, 'not found', {});
        push @msg, "file not found";
      }
    }else{
      $req->respond (404, 'not found', {});
      push @msg, "wrong url";
    }
    errlog @msg;
    $httpd->stop_request;
  }
);

$httpd->run;
