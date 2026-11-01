#!/usr/bin/perl
# usage: perl timeout.pl <seconds> <command...>  -- GNU timeout's core for machines without it (macOS): runs the command in its own
# process group, kills the group after <seconds>, exits 124 then; otherwise exits with the command's status.
use strict; use warnings; use POSIX ();
my $t = shift @ARGV;
my $pid = fork() // die "fork: $!";
if (!$pid) { setpgrp(0, 0); exec @ARGV or die "exec $ARGV[0]: $!"; }
local $SIG{ALRM} = sub { kill 'TERM', -$pid; sleep 2; kill 'KILL', -$pid; waitpid($pid, 0); exit 124 };
alarm $t;
waitpid($pid, 0);
my $s = $?;
exit(POSIX::WIFEXITED($s) ? POSIX::WEXITSTATUS($s) : 128 + POSIX::WTERMSIG($s));
